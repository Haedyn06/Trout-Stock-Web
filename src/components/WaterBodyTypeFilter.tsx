import type { WaterBodyType } from '../types/fishWater'
import { WATER_BODY_TYPES, WATER_BODY_TYPE_LABELS } from '../types/fishWater'

interface WaterBodyTypeFilterProps {
  selected: WaterBodyType[]
  onChange: (types: WaterBodyType[]) => void
  hideLabel?: boolean
}

export default function WaterBodyTypeFilter({
  selected,
  onChange,
  hideLabel = false,
}: WaterBodyTypeFilterProps) {
  function toggle(type: WaterBodyType) {
    onChange(
      selected.includes(type)
        ? selected.filter((t) => t !== type)
        : [...selected, type],
    )
  }

  return (
    <div className="filter-group">
      {!hideLabel && <span className="filter-label">Water body type</span>}
      <div className="trout-filter-chips">
        {WATER_BODY_TYPES.map((type) => (
          <label key={type} className="chip">
            <input
              type="checkbox"
              checked={selected.includes(type)}
              onChange={() => toggle(type)}
            />
            {WATER_BODY_TYPE_LABELS[type]}
          </label>
        ))}
      </div>
    </div>
  )
}
