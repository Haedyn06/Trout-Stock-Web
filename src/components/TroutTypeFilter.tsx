import type { TroutTypeKey } from '../types/fishWater'
import { TROUT_TYPES } from '../types/fishWater'

interface TroutTypeFilterProps {
  selected: TroutTypeKey[]
  onChange: (types: TroutTypeKey[]) => void
}

export default function TroutTypeFilter({
  selected,
  onChange,
}: TroutTypeFilterProps) {
  function toggle(key: TroutTypeKey) {
    onChange(
      selected.includes(key)
        ? selected.filter((t) => t !== key)
        : [...selected, key],
    )
  }

  return (
    <div className="filter-group">
      <span className="filter-label">Trout species present</span>
      <div className="trout-filter-chips">
        {TROUT_TYPES.map(({ key, label }) => (
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
