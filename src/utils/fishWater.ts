import type {
  FishTypeKey,
  FishWater,
  SortDirection,
  SortField,
  TroutTypeKey,
  WaterBodyType,
} from '../types/fishWater'
import { ALL_FISH_TYPES, TROUT_TYPES } from '../types/fishWater'
import { distanceFromCity } from './distance'
import type { ReferenceCity } from '../types/fishWater'

export function getActiveFishTypes(water: FishWater) {
  return ALL_FISH_TYPES.filter(({ key }) => water.fishTypes[key].population > 0)
}

export function getActiveTroutTypes(water: FishWater) {
  return TROUT_TYPES.filter(({ key }) => water.fishTypes[key].population > 0)
}

export function hasTroutType(water: FishWater, troutKey: TroutTypeKey): boolean {
  return water.fishTypes[troutKey].population > 0
}

export function getFishTypeLabel(key: FishTypeKey): string {
  return ALL_FISH_TYPES.find((t) => t.key === key)?.label ?? key
}

export function filterByDistance(
  waters: FishWater[],
  city: ReferenceCity,
  maxDistanceKm: number | null,
): FishWater[] {
  if (maxDistanceKm === null) return waters
  return waters.filter((w) => distanceFromCity(w, city) <= maxDistanceKm)
}

export function filterByTroutTypes(
  waters: FishWater[],
  selectedTrout: TroutTypeKey[],
): FishWater[] {
  if (selectedTrout.length === 0) return waters
  return waters.filter((w) =>
    selectedTrout.every((key) => hasTroutType(w, key)),
  )
}

export function filterByWaterBodyTypes(
  waters: FishWater[],
  selectedTypes: WaterBodyType[],
): FishWater[] {
  if (selectedTypes.length === 0) return waters
  return waters.filter((w) => selectedTypes.includes(w.waterBodyType))
}

export function sortWaters(
  waters: FishWater[],
  field: SortField,
  direction: SortDirection,
  referenceCity: ReferenceCity,
): FishWater[] {
  const sorted = [...waters]
  const order = direction === 'asc' ? 1 : -1

  switch (field) {
    case 'name':
      return sorted.sort(
        (a, b) => order * a.waterBodyName.localeCompare(b.waterBodyName),
      )
    case 'population':
      return sorted.sort((a, b) => order * (a.population - b.population))
    case 'difficulty':
      return sorted.sort((a, b) => order * (a.difficulty - b.difficulty))
    case 'latestStocked':
      return sorted.sort(
        (a, b) =>
          order *
          (new Date(a.latestStockDate).getTime() -
            new Date(b.latestStockDate).getTime()),
      )
    case 'distance':
      return sorted.sort(
        (a, b) =>
          order *
          (distanceFromCity(a, referenceCity) -
            distanceFromCity(b, referenceCity)),
      )
    default:
      return sorted
  }
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-CA')
}
