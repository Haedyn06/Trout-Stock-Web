import type { ReferenceCity } from '../types/fishWater'
import { DISTANCE_OPTIONS, REFERENCE_CITIES } from '../types/fishWater'

interface DistanceFilterProps {
  city: ReferenceCity
  onCityChange: (city: ReferenceCity) => void
  maxDistance: number
  onMaxDistanceChange: (distance: number) => void
  hideLabel?: boolean
}

export default function DistanceFilter({
  city,
  onCityChange,
  maxDistance,
  onMaxDistanceChange,
  hideLabel = false,
}: DistanceFilterProps) {
  return (
    <div className="filter-group">
      {!hideLabel && <label className="filter-label">Distance from</label>}
      <div className="filter-row">
        <select
          value={city}
          onChange={(e) => onCityChange(e.target.value as ReferenceCity)}
          aria-label="Reference city"
        >
          {REFERENCE_CITIES.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          value={maxDistance}
          onChange={(e) => onMaxDistanceChange(Number(e.target.value))}
          aria-label="Maximum distance"
        >
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
