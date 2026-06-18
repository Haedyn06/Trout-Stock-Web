import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import '../utils/leafletIcons'
import { fishWaters, getFishWaterById } from '../data/loadFishWaters'
import type { AlbertaRegion, FishTypeKey, ReferenceCity } from '../types/fishWater'
import { DEFAULT_DISTANCE_KM } from '../types/fishWater'
import FocusedWaterMarker from '../components/FocusedWaterMarker'
import MapFilters from '../components/MapFilters'
import MapLegendOverlay from '../components/MapLegendOverlay'
import MapResizeHandler from '../components/MapResizeHandler'
import WaterMapMarkers from '../components/WaterMapMarkers'
import WaterSearchBar from '../components/WaterSearchBar'
import { useHomeListState } from '../context/HomeListStateContext'
import { filterByAlbertaRegions } from '../utils/albertaRegion'
import {
  filterByDistance,
  filterBySearchQuery,
  filterByTroutTypes,
} from '../utils/fishWater'

const MAP_CENTER: [number, number] = [52.5, -114.5]

/** Keeps panning and zoom locked to North America. */
const NORTH_AMERICA_BOUNDS: [[number, number], [number, number]] = [
  [15, -168],
  [72, -52],
]

export default function MapPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { resetHomeListState } = useHomeListState()
  const focusWaterId = searchParams.get('water')
  const focusWater = focusWaterId ? getFishWaterById(focusWaterId) : undefined
  const isFocused = Boolean(focusWater)

  useEffect(() => {
    resetHomeListState()
  }, [resetHomeListState])

  const [referenceCity, setReferenceCity] = useState<ReferenceCity>('calgary')
  const [maxDistance, setMaxDistance] = useState(DEFAULT_DISTANCE_KM)
  const [selectedTrout, setSelectedTrout] = useState<FishTypeKey[]>([])
  const [selectedRegions, setSelectedRegions] = useState<AlbertaRegion[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)

  const filteredWaters = useMemo(() => {
    if (focusWater) {
      return [focusWater]
    }

    let result = filterBySearchQuery(fishWaters, searchQuery)
    result = filterByDistance(result, referenceCity, maxDistance)
    result = filterByAlbertaRegions(result, selectedRegions)
    result = filterByTroutTypes(result, selectedTrout)
    return result
  }, [
    focusWater,
    searchQuery,
    referenceCity,
    maxDistance,
    selectedRegions,
    selectedTrout,
  ])

  useEffect(() => {
    if (!isFullscreen) {
      return
    }

    document.documentElement.classList.add('map-fullscreen-active')
    document.body.classList.add('map-fullscreen-active')
    document.body.style.overflow = 'hidden'

    return () => {
      document.documentElement.classList.remove('map-fullscreen-active')
      document.body.classList.remove('map-fullscreen-active')
      document.body.style.overflow = ''
    }
  }, [isFullscreen])

  function clearFocus() {
    setSearchParams({})
  }

  const filterProps = {
    referenceCity,
    onReferenceCityChange: setReferenceCity,
    maxDistance,
    onMaxDistanceChange: setMaxDistance,
    selectedRegions,
    onSelectedRegionsChange: setSelectedRegions,
    selectedTrout,
    onSelectedTroutChange: setSelectedTrout,
  }

  const searchProps = {
    searchQuery,
    onSearchQueryChange: setSearchQuery,
    searchResultCount: filteredWaters.length,
    searchTotalCount: fishWaters.length,
  }

  const mapShell = (
    <div className={`map-shell${isFullscreen ? ' map-shell--fullscreen' : ''}`}>
      {isFocused && focusWater && (
        <div className="map-focus-banner">
          <p className="map-focus-banner__text">
            Showing <strong>{focusWater.waterBodyName}</strong>
          </p>
          <button type="button" className="btn btn-secondary btn-sm" onClick={clearFocus}>
            Show all waters
          </button>
        </div>
      )}

      {focusWaterId && !focusWater && (
        <div className="map-focus-banner map-focus-banner--warning">
          <p className="map-focus-banner__text">That water body was not found on the map.</p>
          <button type="button" className="btn btn-secondary btn-sm" onClick={clearFocus}>
            Show all waters
          </button>
        </div>
      )}

      {isFullscreen && !isFocused && (
        <MapLegendOverlay
          markerCount={filteredWaters.length}
          onClose={() => setIsFullscreen(false)}
          {...filterProps}
          {...searchProps}
        />
      )}

      {!isFullscreen && (
        <button
          type="button"
          className="map-fullscreen-btn"
          onClick={() => setIsFullscreen(true)}
          aria-label="Open full screen map"
        >
          Full screen
        </button>
      )}

      <div className="map-container">
        <MapContainer
          center={MAP_CENTER}
          zoom={7}
          minZoom={3}
          maxBounds={NORTH_AMERICA_BOUNDS}
          maxBoundsViscosity={1}
          scrollWheelZoom
          className="leaflet-map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapResizeHandler active={isFullscreen} />
          {focusWater ? (
            <FocusedWaterMarker water={focusWater} referenceCity={referenceCity} />
          ) : (
            <WaterMapMarkers waters={filteredWaters} referenceCity={referenceCity} />
          )}
        </MapContainer>
      </div>
    </div>
  )

  return (
    <div className={`page map-page${isFullscreen ? ' map-page--fullscreen' : ''}`}>
      {!isFullscreen && (
        <>
          <section className="page-hero page-hero--compact">
            <h1>Water Body Map</h1>
            <p>
              {isFocused && focusWater
                ? `Focused on ${focusWater.waterBodyName}. Use "Show all waters" on the map to browse everything again.`
                : 'Click a marker to see population stats and jump to full details.'}
            </p>
          </section>

          {!isFocused && (
            <section className="filters-panel map-filters" aria-label="Map filters">
              <div className="filters-panel__search">
                <WaterSearchBar
                  value={searchProps.searchQuery}
                  onChange={searchProps.onSearchQueryChange}
                  resultCount={searchProps.searchResultCount}
                  totalCount={searchProps.searchTotalCount}
                />
              </div>
              <MapFilters {...filterProps} />
            </section>
          )}

          <p className="results-count">
            Showing {filteredWaters.length} marker
            {filteredWaters.length !== 1 ? 's' : ''}
          </p>
        </>
      )}

      {mapShell}
    </div>
  )
}
