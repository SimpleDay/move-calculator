import { analyzeInventoryPhoto, InventoryAnalysisRequestError } from '@/features/inventory/client/analyzeInventoryPhoto'
import type { InventoryAnalysis } from '@/features/inventory/model/inventoryAnalysis'
import type { QuoteDraft, QuoteFlowAction } from '@/features/quoteFlow/model'
import { Box, Camera, Check, LoaderCircle, PackageOpen, ScanLine, SlidersHorizontal } from 'lucide-react'
import { type ChangeEvent, type Dispatch, useState } from 'react'
import { ChoiceCard } from '../ChoiceCard'
import { Field, TextInput } from '../FormControls'
import { StepLayout } from '../StepLayout'

type InventoryStepProps = {
  draft: QuoteDraft
  dispatch: Dispatch<QuoteFlowAction>
}

const quickPresets = [
  { id: 'compact', title: 'Kompakt', description: '1–2 Zimmer', volumeM3: 12, rooms: 2, boxes: 18 },
  { id: 'standard', title: 'Standard', description: '3–4 Zimmer', volumeM3: 24, rooms: 3.5, boxes: 35 },
  { id: 'large', title: 'Gross', description: '5+ Zimmer / Haus', volumeM3: 42, rooms: 5.5, boxes: 65 },
]

type PhotoAnalysisProps = {
  draft: QuoteDraft
  dispatch: Dispatch<QuoteFlowAction>
}

function PhotoAnalysis({ draft, dispatch }: PhotoAnalysisProps) {
  const [analysis, setAnalysis] = useState<InventoryAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [applied, setApplied] = useState(false)

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) {
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setAnalysis(null)
    setApplied(false)
    try {
      setAnalysis(await analyzeInventoryPhoto(file))
    } catch (analysisError) {
      setError(
        analysisError instanceof InventoryAnalysisRequestError
          ? analysisError.message
          : 'Das Foto konnte nicht analysiert werden.',
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

  const applyAnalysis = () => {
    if (!analysis || applied) {
      return
    }
    dispatch({
      type: 'setInventory',
      value: {
        volumeM3: Math.round((draft.volumeM3 + analysis.estimatedVolumeM3) * 10) / 10,
        inventoryMethod: 'photo',
      },
    })
    setApplied(true)
  }

  return (
    <div className="rounded-2xl border border-dashed border-[#b8c6bf] bg-[#f9faf7] p-5">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#e5eee9] text-[#315d58]">
            <ScanLine className="size-5" />
          </span>
          <div>
            <p className="font-semibold text-[#173c3a]">Einen Raum analysieren</p>
            <p className="mt-1 text-sm leading-5 text-[#6f7e79]">
              JPG, PNG oder WebP bis 10 MB. Das Bild wird nicht gespeichert.
            </p>
          </div>
        </div>
        <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-[#b9c6c0] bg-white px-4 text-sm font-semibold text-[#294f4a] transition hover:border-[var(--tenant-accent)]">
          {isAnalyzing ? <LoaderCircle className="size-4 animate-spin" /> : <Camera className="size-4" />}
          {isAnalyzing ? 'Gemini analysiert …' : 'Foto wählen'}
          <input
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={isAnalyzing}
            onChange={onFileChange}
            type="file"
          />
        </label>
      </div>

      {error ? <p className="mt-4 rounded-xl bg-[#fff0eb] p-3 text-sm leading-5 text-[#9a4329]">{error}</p> : null}

      {analysis ? (
        <div className="mt-5 rounded-xl border border-[#dce3dd] bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#788783]">
                Vorschlag · {analysis.roomName}
              </p>
              <p className="mt-1 font-semibold text-[#173c3a]">{analysis.estimatedVolumeM3} m³ sichtbar erkannt</p>
            </div>
            <span className="rounded-full bg-[#edf3ef] px-3 py-1 text-xs font-semibold text-[#496a64]">
              {Math.round(analysis.averageConfidence * 100)}% mittlere Sicherheit
            </span>
          </div>
          <ul className="mt-4 divide-y divide-[#edf0ec]">
            {analysis.items.map((item) => (
              <li className="flex items-center justify-between gap-4 py-2.5 text-sm" key={item.catalogItemId}>
                <span className="text-[#405d58]">
                  {item.quantity} × {item.name}
                </span>
                <span className="font-semibold text-[#173c3a]">{item.totalVolumeM3} m³</span>
              </li>
            ))}
          </ul>
          {analysis.unseenAreas.length > 0 ? (
            <p className="mt-3 text-xs leading-5 text-[#7a6a4e]">
              Bitte zusätzlich prüfen: {analysis.unseenAreas.join(', ')}
            </p>
          ) : null}
          <button
            className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#173c3a] px-4 text-sm font-semibold text-white disabled:opacity-60"
            disabled={applied}
            onClick={applyAnalysis}
            type="button"
          >
            <Check className="size-4" /> {applied ? 'Zum Volumen addiert' : 'Zum Gesamtvolumen addieren'}
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function InventoryStep({ draft, dispatch }: InventoryStepProps) {
  return (
    <StepLayout
      description="Wählen Sie den schnellsten Weg. Jede Variante landet im gleichen strukturierten Inventar und kann korrigiert werden."
      eyebrow="Schritt 3 von 6"
      title="Wie möchten Sie Ihr Inventar erfassen?"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <ChoiceCard
          compact
          description="In weniger als einer Minute"
          icon={PackageOpen}
          onSelect={() => dispatch({ type: 'setInventoryMethod', value: 'quick' })}
          selected={draft.inventoryMethod === 'quick'}
          title="Schnell schätzen"
        />
        <ChoiceCard
          compact
          description="Gemini erkennt sichtbare Möbel"
          icon={Camera}
          onSelect={() => dispatch({ type: 'setInventoryMethod', value: 'photo' })}
          selected={draft.inventoryMethod === 'photo'}
          title="Mit Fotos"
        />
        <ChoiceCard
          compact
          description="Volumen selbst eingeben"
          icon={SlidersHorizontal}
          onSelect={() => dispatch({ type: 'setInventoryMethod', value: 'manual' })}
          selected={draft.inventoryMethod === 'manual'}
          title="Genau eingeben"
        />
      </div>

      {draft.inventoryMethod === 'quick' ? (
        <div className="mt-6 rounded-2xl border border-[#dfe4de] bg-white p-5 sm:p-6">
          <p className="mb-3 text-sm font-semibold text-[#173c3a]">Welche Grösse passt am ehesten?</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {quickPresets.map((preset) => (
              <ChoiceCard
                compact
                description={`${preset.description} · ca. ${preset.boxes} Kartons`}
                key={preset.id}
                onSelect={() =>
                  dispatch({
                    type: 'setInventory',
                    value: {
                      inventoryMethod: 'quick',
                      volumeM3: preset.volumeM3,
                      rooms: preset.rooms,
                      boxes: preset.boxes,
                    },
                  })
                }
                selected={draft.volumeM3 === preset.volumeM3}
                title={`${preset.title} · ${preset.volumeM3} m³`}
              />
            ))}
          </div>
        </div>
      ) : null}

      {draft.inventoryMethod === 'photo' ? (
        <div className="mt-6 space-y-5">
          <PhotoAnalysis dispatch={dispatch} draft={draft} />
          <div className="grid gap-4 rounded-2xl border border-[#dfe4de] bg-white p-5 sm:grid-cols-3 sm:p-6">
            <InventoryFields dispatch={dispatch} draft={draft} />
          </div>
        </div>
      ) : null}

      {draft.inventoryMethod === 'manual' ? (
        <div className="mt-6 grid gap-4 rounded-2xl border border-[#dfe4de] bg-white p-5 sm:grid-cols-3 sm:p-6">
          <InventoryFields dispatch={dispatch} draft={draft} />
        </div>
      ) : null}

      {draft.inventoryMethod ? (
        <div className="mt-6">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#173c3a]">
            <Box className="size-4 text-[#71807c]" /> Gibt es etwas Besonderes?
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <ChoiceCard
              compact
              description="Klavier oder Flügel"
              onSelect={() =>
                dispatch({ type: 'setSpecialtyItem', item: 'piano', selected: !draft.specialtyItems.piano })
              }
              selected={draft.specialtyItems.piano}
              title="Klaviertransport"
            />
            <ChoiceCard
              compact
              description="Schwerer Tresor ab ca. 80 kg"
              onSelect={() =>
                dispatch({ type: 'setSpecialtyItem', item: 'safe', selected: !draft.specialtyItems.safe })
              }
              selected={draft.specialtyItems.safe}
              title="Tresortransport"
            />
          </div>
        </div>
      ) : null}
    </StepLayout>
  )
}

function InventoryFields({ draft, dispatch }: InventoryStepProps) {
  return (
    <>
      <Field hint="Gesamtes sichtbares und verpacktes Volumen" htmlFor="volume" label="Umzugsvolumen">
        <div className="relative">
          <TextInput
            className="pr-12"
            id="volume"
            min="1"
            onChange={(event) =>
              dispatch({ type: 'setInventory', value: { volumeM3: Number(event.target.value) || 0 } })
            }
            step="0.5"
            type="number"
            value={draft.volumeM3 || ''}
          />
          <span className="absolute right-4 top-3.5 text-sm text-[#71807c]">m³</span>
        </div>
      </Field>
      <Field htmlFor="rooms" label="Zimmer">
        <TextInput
          id="rooms"
          min="0.5"
          onChange={(event) => dispatch({ type: 'setInventory', value: { rooms: Number(event.target.value) || 0 } })}
          step="0.5"
          type="number"
          value={draft.rooms || ''}
        />
      </Field>
      <Field htmlFor="boxes" label="Kartons" optional>
        <TextInput
          id="boxes"
          min="0"
          onChange={(event) => dispatch({ type: 'setInventory', value: { boxes: Number(event.target.value) || 0 } })}
          type="number"
          value={draft.boxes || ''}
        />
      </Field>
    </>
  )
}
