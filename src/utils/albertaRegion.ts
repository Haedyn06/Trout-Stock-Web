import type { AlbertaRegion, FishWater } from '../types/fishWater'

/** Approximate geographic centre of Alberta (NAD83). */
const ALBERTA_CENTER = { lat: 53.933, lng: -116.576 }

export function getAlbertaRegion(latitude: number, longitude: number): AlbertaRegion {
  const isNorth = latitude >= ALBERTA_CENTER.lat
  const isEast = longitude >= ALBERTA_CENTER.lng

  if (isNorth && isEast) return 'northeast'
  if (isNorth && !isEast) return 'northwest'
  if (!isNorth && isEast) return 'southeast'
  return 'southwest'
}

export function filterByAlbertaRegions(
  waters: FishWater[],
  selectedRegions: AlbertaRegion[],
): FishWater[] {
  if (selectedRegions.length === 0) return waters

  return waters.filter((water) => {
    const region = getAlbertaRegion(
      water.location.latitude,
      water.location.longitude,
    )
    return selectedRegions.includes(region)
  })
}
