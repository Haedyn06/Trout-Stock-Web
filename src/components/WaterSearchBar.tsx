interface WaterSearchBarProps {
  value: string
  onChange: (value: string) => void
  resultCount: number
  totalCount: number
}

export default function WaterSearchBar({
  value,
  onChange,
  resultCount,
  totalCount,
}: WaterSearchBarProps) {
  const isActive = value.trim().length > 0

  return (
    <div className="water-search">
      <label className="filter-label" htmlFor="water-search-input">
        Search waters
      </label>
      <div className="water-search__field">
        <input
          id="water-search-input"
          type="search"
          className="water-search__input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search by lake name, location, or fish type…"
          aria-label="Search water bodies"
          autoComplete="off"
          spellCheck={false}
        />
        {isActive && (
          <button
            type="button"
            className="water-search__clear"
            onClick={() => onChange('')}
            aria-label="Clear search"
          >
            Clear
          </button>
        )}
      </div>
      {isActive && (
        <p className="water-search__hint" role="status" aria-live="polite">
          {resultCount} of {totalCount} water bodies match &ldquo;{value.trim()}&rdquo;
        </p>
      )}
    </div>
  )
}
