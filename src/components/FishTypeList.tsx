import type { FishWater } from '../types/fishWater'
import { getActiveFishTypes, formatNumber } from '../utils/fishWater'

interface FishTypeListProps {
  water: FishWater
  compact?: boolean
}

export default function FishTypeList({ water, compact = false }: FishTypeListProps) {
  const active = getActiveFishTypes(water)

  if (active.length === 0) {
    return <p className="muted">No fish population recorded.</p>
  }

  return (
    <ul className={`fish-type-list${compact ? ' fish-type-list--compact' : ''}`}>
      {active.map(({ key, label }) => {
        const stats = water.fishTypes[key]
        return (
          <li key={key}>
            <span className="fish-name">{label}</span>
            <span className="fish-pop">{formatNumber(stats.population)}</span>
          </li>
        )
      })}
    </ul>
  )
}
