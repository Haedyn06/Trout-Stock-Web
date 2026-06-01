import type { FishWater, ReferenceCity } from '../types/fishWater'

const CITY_LABELS: Record<ReferenceCity, string> = {
  calgary: 'Calgary',
  edmonton: 'Edmonton',
}

export function distanceFromCity(water: FishWater, city: ReferenceCity): number {
  return city === 'calgary'
    ? water.location.cityRange.calgaryKMRange
    : water.location.cityRange.edmontonKMRange
}

export function getCityLabel(city: ReferenceCity): string {
  return CITY_LABELS[city]
}

export function formatDistance(km: number): string {
  return `${Math.round(km)} km`
}

export function formatDistanceFromCity(km: number, city: ReferenceCity): string {
  return `${formatDistance(km)} from ${getCityLabel(city)}`
}
