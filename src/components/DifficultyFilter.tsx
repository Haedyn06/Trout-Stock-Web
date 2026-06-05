import { DIFFICULTY_OPTIONS } from '../types/fishWater'

interface DifficultyFilterProps {
  selected: number[]
  onChange: (levels: number[]) => void
  hideLabel?: boolean
}

export default function DifficultyFilter({
  selected,
  onChange,
  hideLabel = false,
}: DifficultyFilterProps) {
  function toggle(level: number) {
    onChange(
      selected.includes(level)
        ? selected.filter((l) => l !== level)
        : [...selected, level],
    )
  }

  return (
    <div className="filter-group">
      {!hideLabel && <span className="filter-label">Difficulty</span>}
      <div className="trout-filter-chips">
        {DIFFICULTY_OPTIONS.map(({ value, label }) => (
          <label key={value} className="chip">
            <input
              type="checkbox"
              checked={selected.includes(value)}
              onChange={() => toggle(value)}
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  )
}
