import type { SortDirection, SortField } from '../types/fishWater'
import {
  DEFAULT_SORT_DIRECTION,
  SORT_DIRECTION_LABELS,
  SORT_FIELDS,
} from '../types/fishWater'

interface SortControlsProps {
  field: SortField
  direction: SortDirection
  onFieldChange: (field: SortField) => void
  onDirectionChange: (direction: SortDirection) => void
}

export default function SortControls({
  field,
  direction,
  onFieldChange,
  onDirectionChange,
}: SortControlsProps) {
  function handleFieldChange(nextField: SortField) {
    onFieldChange(nextField)
    onDirectionChange(DEFAULT_SORT_DIRECTION[nextField])
  }

  return (
    <div className="filter-group">
      <span className="filter-label">Sort by</span>
      <div className="filter-row">
        <select
          id="sort-field-select"
          value={field}
          onChange={(e) => handleFieldChange(e.target.value as SortField)}
          aria-label="Sort field"
        >
          {SORT_FIELDS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          id="sort-direction-select"
          value={direction}
          onChange={(e) =>
            onDirectionChange(e.target.value as SortDirection)
          }
          aria-label="Sort direction"
        >
          <option value="asc">{SORT_DIRECTION_LABELS.asc}</option>
          <option value="desc">{SORT_DIRECTION_LABELS.desc}</option>
        </select>
      </div>
    </div>
  )
}
