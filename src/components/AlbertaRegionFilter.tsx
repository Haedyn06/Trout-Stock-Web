import type { AlbertaRegion } from '../types/fishWater'
import { ALBERTA_REGIONS } from '../types/fishWater'

interface AlbertaRegionFilterProps {
  selected: AlbertaRegion[]
  onChange: (regions: AlbertaRegion[]) => void
  hideLabel?: boolean
}

export default function AlbertaRegionFilter({
  selected,
  onChange,
  hideLabel = false,
}: AlbertaRegionFilterProps) {
  function toggle(key: AlbertaRegion) {
    onChange(
      selected.includes(key)
        ? selected.filter((region) => region !== key)
        : [...selected, key],
    )
  }

  return (
    <div className="filter-group">
      {!hideLabel && <span className="filter-label">Alberta region</span>}
      <div className="trout-filter-chips">
        {ALBERTA_REGIONS.map(({ key, label }) => (
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
