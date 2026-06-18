import { useEffect, useState, type MouseEvent, type TouchEvent } from 'react'
import type { MapFiltersProps } from './MapFilters'
import MapFilters from './MapFilters'
import useMediaQuery from '../hooks/useMediaQuery'
import WaterSearchBar from './WaterSearchBar'

interface MapLegendOverlayProps extends MapFiltersProps {
  markerCount: number
  onClose: () => void
  searchQuery: string
  onSearchQueryChange: (value: string) => void
  searchResultCount: number
  searchTotalCount: number
}

function stopSummaryToggle(event: MouseEvent | TouchEvent) {
  event.preventDefault()
  event.stopPropagation()
}

export default function MapLegendOverlay({
  markerCount,
  onClose,
  searchQuery,
  onSearchQueryChange,
  searchResultCount,
  searchTotalCount,
  ...filterProps
}: MapLegendOverlayProps) {
  const isMobile = useMediaQuery('(max-width: 640px)')
  const [isPanelOpen, setIsPanelOpen] = useState(() => !isMobile)

  useEffect(() => {
    setIsPanelOpen(!isMobile)
  }, [isMobile])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  function handleExitClick(event: MouseEvent<HTMLButtonElement>) {
    stopSummaryToggle(event)
    onClose()
  }

  return (
    <aside
      className={`map-legend${isMobile ? ' map-legend--mobile' : ''}${isPanelOpen ? ' map-legend--open' : ' map-legend--collapsed'}`}
      aria-label="Map filters"
    >
      <details
        className="map-legend__panel"
        open={isPanelOpen}
        onToggle={(event) => setIsPanelOpen(event.currentTarget.open)}
      >
        <summary className="map-legend__header">
          <div className="map-legend__header-text">
            <span className="map-legend__title">Map filters</span>
            <span className="map-legend__count">
              {markerCount} marker{markerCount !== 1 ? 's' : ''} shown
            </span>
          </div>
          <button
            type="button"
            className="map-legend__close"
            onClick={handleExitClick}
            onMouseDown={stopSummaryToggle}
            onTouchStart={stopSummaryToggle}
            aria-label="Exit full screen"
          >
            ×
          </button>
        </summary>

        <div className="map-legend__inner">
          <div className="map-legend__body">
            <div className="filters-panel__search map-legend__search">
              <WaterSearchBar
                value={searchQuery}
                onChange={onSearchQueryChange}
                resultCount={searchResultCount}
                totalCount={searchTotalCount}
              />
            </div>
            <MapFilters {...filterProps} />
          </div>

          <div className="map-legend__footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Exit full screen
            </button>
          </div>
        </div>
      </details>
    </aside>
  )
}
