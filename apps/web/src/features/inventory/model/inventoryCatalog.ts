export const inventoryCatalog = [
  { id: 'moving-box', name: 'Umzugskarton', volumeM3: 0.08 },
  { id: 'sofa', name: 'Sofa', volumeM3: 2.2 },
  { id: 'armchair', name: 'Sessel', volumeM3: 0.8 },
  { id: 'dining-table', name: 'Esstisch', volumeM3: 1.4 },
  { id: 'chair', name: 'Stuhl', volumeM3: 0.35 },
  { id: 'wardrobe', name: 'Kleiderschrank', volumeM3: 1.3 },
  { id: 'bed', name: 'Bett', volumeM3: 1.6 },
  { id: 'dresser', name: 'Kommode', volumeM3: 0.8 },
  { id: 'shelf', name: 'Regal', volumeM3: 0.6 },
  { id: 'television', name: 'Fernseher', volumeM3: 0.2 },
  { id: 'desk', name: 'Schreibtisch', volumeM3: 1.1 },
  { id: 'appliance', name: 'Grossgerät', volumeM3: 0.8 },
  { id: 'plant', name: 'Pflanze', volumeM3: 0.3 },
  { id: 'other-bulky', name: 'Weiteres grosses Möbel', volumeM3: 1 },
] as const

export type InventoryCatalogItemId = (typeof inventoryCatalog)[number]['id']

export function getInventoryCatalogPrompt(): string {
  return inventoryCatalog.map((item) => `${item.id}: ${item.name} (${item.volumeM3} m³ pro Stück)`).join('\n')
}
