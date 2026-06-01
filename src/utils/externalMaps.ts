import type { FishWater } from '../types/fishWater'

export function getGoogleMapsNavigateUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`
}

export function getGoogleMapsNavigateUrlForWater(water: FishWater): string {
  const { latitude, longitude } = water.location
  return getGoogleMapsNavigateUrl(latitude, longitude)
}
