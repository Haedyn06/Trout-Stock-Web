import { DIFFICULTY_LABELS, MAX_DIFFICULTY } from '../types/fishWater'

interface DifficultyBadgeProps {
  level: number
}

export default function DifficultyBadge({ level }: DifficultyBadgeProps) {
  const clampedLevel = Math.min(Math.max(level, 1), MAX_DIFFICULTY)
  const label = DIFFICULTY_LABELS[clampedLevel] ?? `Level ${clampedLevel}`

  return (
    <div
      className={`difficulty-rating difficulty-${clampedLevel}`}
      aria-label={`${clampedLevel} out of ${MAX_DIFFICULTY} stars, ${label}`}
    >
      <span className="difficulty-stars" aria-hidden="true">
        {Array.from({ length: MAX_DIFFICULTY }, (_, i) => (
          <span
            key={i}
            className={i < clampedLevel ? 'star star--filled' : 'star star--empty'}
          >
            ★
          </span>
        ))}
      </span>
      <span className="difficulty-label">{label}</span>
    </div>
  )
}
