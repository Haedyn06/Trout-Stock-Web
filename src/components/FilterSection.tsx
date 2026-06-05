import type { ReactNode } from 'react'

interface FilterSectionProps {
  title: string
  children: ReactNode
  alwaysOpen?: boolean
}

export default function FilterSection({
  title,
  children,
  alwaysOpen = false,
}: FilterSectionProps) {
  if (alwaysOpen) {
    return (
      <div className="filter-section filter-section--open">
        <div className="filter-section__summary filter-section__summary--static">
          {title}
        </div>
        <div className="filter-section__body">{children}</div>
      </div>
    )
  }

  return (
    <details className="filter-section">
      <summary className="filter-section__summary">{title}</summary>
      <div className="filter-section__body">{children}</div>
    </details>
  )
}
