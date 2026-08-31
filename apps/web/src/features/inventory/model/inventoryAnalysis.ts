import { inventoryCatalog, type InventoryCatalogItemId } from './inventoryCatalog'

export type RawInventorySuggestion = {
  catalogItemId: InventoryCatalogItemId
  quantity: number
  confidence: number
  note: string
}

export type RawInventoryAnalysis = {
  roomName: string
  items: RawInventorySuggestion[]
  unseenAreas: string[]
}

export type InventorySuggestion = RawInventorySuggestion & {
  name: string
  unitVolumeM3: number
  totalVolumeM3: number
}

export type InventoryAnalysis = {
  roomName: string
  items: InventorySuggestion[]
  unseenAreas: string[]
  estimatedVolumeM3: number
  averageConfidence: number
}

export const minimumAutoAcceptedConfidence = 0.85

export function normalizeInventoryAnalysis(analysis: RawInventoryAnalysis): InventoryAnalysis {
  const needsReview: string[] = []
  const items = analysis.items.flatMap((suggestion) => {
    const catalogItem = inventoryCatalog.find((item) => item.id === suggestion.catalogItemId)
    if (!catalogItem) {
      return []
    }

    const quantity = Math.max(1, Math.round(suggestion.quantity))
    const confidence = Math.min(1, Math.max(0, suggestion.confidence))
    if (confidence < minimumAutoAcceptedConfidence) {
      const note = suggestion.note ? `: ${suggestion.note}` : ''
      needsReview.push(`${quantity} × ${catalogItem.name}${note}`)
      return []
    }

    return [
      {
        ...suggestion,
        quantity,
        confidence,
        name: catalogItem.name,
        unitVolumeM3: catalogItem.volumeM3,
        totalVolumeM3: Math.round(catalogItem.volumeM3 * quantity * 100) / 100,
      },
    ]
  })
  const estimatedVolumeM3 = Math.round(items.reduce((sum, item) => sum + item.totalVolumeM3, 0) * 10) / 10
  const averageConfidence =
    items.length === 0
      ? 0
      : Math.round((items.reduce((sum, item) => sum + item.confidence, 0) / items.length) * 100) / 100

  return {
    roomName: analysis.roomName,
    items,
    unseenAreas: [...analysis.unseenAreas, ...needsReview.map((item) => `Unsicher erkannt – manuell prüfen: ${item}`)],
    estimatedVolumeM3,
    averageConfidence,
  }
}
