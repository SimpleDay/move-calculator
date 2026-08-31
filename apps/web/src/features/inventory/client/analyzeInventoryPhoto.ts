import type { InventoryAnalysis } from '@/features/inventory/model/inventoryAnalysis'

export class InventoryAnalysisRequestError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message)
    this.name = 'InventoryAnalysisRequestError'
  }
}

export async function analyzeInventoryPhoto(file: File): Promise<InventoryAnalysis> {
  const formData = new FormData()
  formData.set('photo', file)

  const response = await fetch('/api/ai/inventory', {
    method: 'POST',
    body: formData,
  })
  const body = (await response.json().catch(() => null)) as
    | (InventoryAnalysis & { code?: never })
    | { code?: string; message?: string }
    | null

  if (!response.ok) {
    throw new InventoryAnalysisRequestError(
      body && 'message' in body && body.message ? body.message : 'Das Foto konnte nicht analysiert werden.',
      body && 'code' in body && body.code ? body.code : 'analysis_failed',
    )
  }

  return body as InventoryAnalysis
}
