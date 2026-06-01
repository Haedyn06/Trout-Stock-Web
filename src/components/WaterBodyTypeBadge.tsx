import { WATER_BODY_TYPE_LABELS } from '../types/fishWater'
import type { WaterBodyType } from '../types/fishWater'

interface WaterBodyTypeBadgeProps {
  type: WaterBodyType
}

export default function WaterBodyTypeBadge({ type }: WaterBodyTypeBadgeProps) {
  return (
    <span className={`water-type-badge water-type-badge--${type}`}>
      {WATER_BODY_TYPE_LABELS[type]}
    </span>
  )
}
