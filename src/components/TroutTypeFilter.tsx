import type { FishTypeKey } from '../types/fishWater'
import { ALL_FISH_TYPES } from '../types/fishWater'

interface TroutTypeFilterProps {
  selected: FishTypeKey[]
  onChange: (types: FishTypeKey[]) => void
  hideLabel?: boolean
}

export default function TroutTypeFilter({
  selected,
  onChange,
  hideLabel = false,
}: TroutTypeFilterProps) {
  function toggle(key: FishTypeKey) {
    onChange(
      selected.includes(key)
        ? selected.filter((t) => t !== key)
        : [...selected, key],
    )
  }

  return (
    <div className="filter-group">
      {!hideLabel && <span className="filter-label">Fish species present</span>}
      <div className="trout-filter-chips">
        {ALL_FISH_TYPES.map(({ key, label }) => (
          <label key={key} className="chip">
            <input
              type="checkbox"
              checked={selected.includes(key)}
              onChange={() => toggle(key)}
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  )
}
