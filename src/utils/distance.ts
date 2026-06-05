import type { FishWater, ReferenceCity } from '../types/fishWater'
import { REFERENCE_CITIES } from '../types/fishWater'

const REFERENCE_CITY_COORDS: Record<
  ReferenceCity,
  { lat: number; lng: number }
> = {
  calgary: { lat: 51.0447, lng: -114.0719 },
  edmonton: { lat: 53.5461, lng: -113.4938 },
  grandPrairie: { lat: 55.1707, lng: -118.7957 },
  fortMcmurray: { lat: 56.7267, lng: -111.379 },
  lethbridge: { lat: 49.6942, lng: -112.834 },
  redDeer: { lat: 52.269, lng: -113.8117 },
}

const CITY_LABELS = Object.fromEntries(
  REFERENCE_CITIES.map(({ value, label }) => [value, label]),
) as Record<ReferenceCity, string>

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (degrees: number) => (degrees * Math.PI) / 180
  const earthRadiusKm = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function storedDistanceFallback(water: FishWater, city: ReferenceCity): number | null {
  const { cityRange } = water.location

  if (city === 'calgary' && cityRange.calgaryKMRange > 0) {
    return cityRange.calgaryKMRange
  }

  if (city === 'edmonton' && cityRange.edmontonKMRange > 0) {
    return cityRange.edmontonKMRange
  }

  return null
}

export function distanceFromCity(water: FishWater, city: ReferenceCity): number {
  const { latitude, longitude } = water.location

  if (latitude !== 0 && longitude !== 0) {
    const coords = REFERENCE_CITY_COORDS[city]
    return Math.round(haversineKm(latitude, longitude, coords.lat, coords.lng))
  }

  return storedDistanceFallback(water, city) ?? Number.POSITIVE_INFINITY
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
