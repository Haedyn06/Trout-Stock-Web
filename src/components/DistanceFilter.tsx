import type { ReferenceCity } from '../types/fishWater'
import { DISTANCE_OPTIONS } from '../types/fishWater'
import { getCityLabel } from '../utils/distance'

interface DistanceFilterProps {
  city: ReferenceCity
  onCityChange: (city: ReferenceCity) => void
  maxDistance: number | null
  onMaxDistanceChange: (distance: number | null) => void
}

export default function DistanceFilter({
  city,
  onCityChange,
  maxDistance,
  onMaxDistanceChange,
}: DistanceFilterProps) {
  return (
    <div className="filter-group">
      <label className="filter-label">Distance from</label>
      <div className="filter-row">
        <select
          value={city}
          onChange={(e) => onCityChange(e.target.value as ReferenceCity)}
          aria-label="Reference city"
        >
          <option value="calgary">{getCityLabel('calgary')}</option>
          <option value="edmonton">{getCityLabel('edmonton')}</option>
        </select>
        <select
          value={maxDistance ?? ''}
          onChange={(e) =>
            onMaxDistanceChange(
              e.target.value === '' ? null : Number(e.target.value),
            )
          }
          aria-label="Maximum distance"
        >
          <option value="">Any distance</option>
          {DISTANCE_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
