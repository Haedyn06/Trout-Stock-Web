import type { FishWater } from '../types/fishWater'
import { getGoogleMapsNavigateUrlForWater } from '../utils/externalMaps'

interface ExternalMapLinksProps {
  water: FishWater
  compact?: boolean
}

export default function ExternalMapLinks({
  water,
  compact = false,
}: ExternalMapLinksProps) {
  const href = getGoogleMapsNavigateUrlForWater(water)

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={compact ? 'btn btn-secondary btn-sm' : 'btn btn-secondary'}
    >
      Navigate in Google Maps
    </a>
  )
}
