import { expect, test } from 'vitest'
import { normalizeInventoryAnalysis } from './inventoryAnalysis'

test('normalizes AI suggestions against deterministic catalog volumes', () => {
  const result = normalizeInventoryAnalysis({
    roomName: 'Wohnzimmer',
    items: [
      { catalogItemId: 'sofa', quantity: 1, confidence: 0.94, note: '' },
      { catalogItemId: 'chair', quantity: 4, confidence: 0.86, note: 'teilweise verdeckt' },
    ],
    unseenAreas: ['Schrankinhalt'],
  })

  expect(result).toMatchObject({
    estimatedVolumeM3: 3.6,
    averageConfidence: 0.9,
  })
  expect(result.items[0]).toMatchObject({ name: 'Sofa', totalVolumeM3: 2.2 })
})

test('keeps low-confidence suggestions out of the automatic volume and surfaces them for review', () => {
  const result = normalizeInventoryAnalysis({
    roomName: 'Wohnzimmer',
    items: [
      { catalogItemId: 'sofa', quantity: 1, confidence: 0.97, note: '' },
      { catalogItemId: 'chair', quantity: 2, confidence: 0.8, note: 'nicht direkt sichtbar' },
    ],
    unseenAreas: [],
  })

  expect(result.items).toHaveLength(1)
  expect(result.estimatedVolumeM3).toBe(2.2)
  expect(result.unseenAreas).toContain('Unsicher erkannt – manuell prüfen: 2 × Stuhl: nicht direkt sichtbar')
})
