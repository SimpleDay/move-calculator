import { normalizeInventoryAnalysis, type RawInventoryAnalysis } from '@/features/inventory/model/inventoryAnalysis'
import { getInventoryCatalogPrompt, inventoryCatalog } from '@/features/inventory/model/inventoryCatalog'
import { AiGatewayNotConfiguredError, createGeminiModel, getGeminiProviderOptions } from '@/lib/ai'
import { generateText, Output } from 'ai'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
const allowedMediaTypes = ['image/jpeg', 'image/png', 'image/webp'] as const
const catalogItemIds = inventoryCatalog.map((item) => item.id) as [
  (typeof inventoryCatalog)[number]['id'],
  ...(typeof inventoryCatalog)[number]['id'][],
]

const rawInventoryAnalysisSchema = z.object({
  roomName: z.string().min(1).max(100),
  items: z
    .array(
      z.object({
        catalogItemId: z.enum(catalogItemIds),
        quantity: z.number().int().min(1).max(100),
        confidence: z.number().min(0).max(1),
        note: z.string().max(200),
      }),
    )
    .max(80),
  unseenAreas: z.array(z.string().max(200)).max(20),
})

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null)
  const photo = formData?.get('photo')
  if (!(photo instanceof File)) {
    return NextResponse.json({ code: 'invalid_file', message: 'Bitte wählen Sie ein Foto aus.' }, { status: 400 })
  }
  if (!allowedMediaTypes.some((mediaType) => mediaType === photo.type)) {
    return NextResponse.json(
      { code: 'invalid_file_type', message: 'Unterstützt werden JPG, PNG und WebP.' },
      { status: 415 },
    )
  }
  if (photo.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { code: 'file_too_large', message: 'Das Foto darf höchstens 10 MB gross sein.' },
      { status: 413 },
    )
  }

  try {
    const model = createGeminiModel()
    const { output } = await generateText({
      model,
      providerOptions: getGeminiProviderOptions(model.modelId),
      output: Output.object({ schema: rawInventoryAnalysisSchema }),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analysiere dieses Foto als Inventarhilfe für einen Schweizer Wohnungsumzug.

Ordne nur klar sichtbare Gegenstände einem Eintrag aus diesem Katalog zu:
${getInventoryCatalogPrompt()}

Regeln:
- Zähle gleiche sichtbare Gegenstände zusammen.
- Leite keine Gegenstände aus dem Raumkontext oder aus anderen Objekten ab; sichtbare Tassen bedeuten zum Beispiel nicht, dass Stühle vorhanden sind.
- Wenn ein Gegenstand nicht positiv als sichtbar identifiziert werden kann, lasse ihn weg, statt ihn mit einer unsicheren Notiz aufzunehmen.
- Erfinde keine verdeckten Gegenstände und schätze kein eigenes Volumen.
- Nutze "other-bulky" nur für klar sichtbare grosse Möbel ohne passenden Eintrag.
- Nenne mögliche unsichtbare Bereiche wie Schrankinhalt nur unter unseenAreas.
- confidence beschreibt die Sicherheit der Erkennung zwischen 0 und 1.
- note ist leer, wenn keine konkrete Unsicherheit erklärt werden muss.`,
            },
            {
              type: 'file',
              mediaType: photo.type,
              data: new Uint8Array(await photo.arrayBuffer()),
            },
          ],
        },
      ],
    })

    return NextResponse.json(normalizeInventoryAnalysis(output as RawInventoryAnalysis))
  } catch (error) {
    if (error instanceof AiGatewayNotConfiguredError) {
      return NextResponse.json(
        {
          code: 'ai_not_configured',
          message:
            'Die Fotoanalyse ist in dieser lokalen Demo noch nicht konfiguriert. Bitte erfassen Sie das Volumen manuell.',
        },
        { status: 503 },
      )
    }

    return NextResponse.json(
      {
        code: 'analysis_failed',
        message: 'Die Fotoanalyse ist gerade nicht verfügbar. Ihre Eingaben bleiben erhalten.',
      },
      { status: 502 },
    )
  }
}
