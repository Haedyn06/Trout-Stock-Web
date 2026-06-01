import { useMemo, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import '../utils/leafletIcons'
import { fishWaters } from '../data/loadFishWaters'
import type { AlbertaRegion, ReferenceCity, TroutTypeKey, WaterBodyType } from '../types/fishWater'
import AlbertaRegionFilter from '../components/AlbertaRegionFilter'
import DistanceFilter from '../components/DistanceFilter'
import MapPopupContent from '../components/MapPopupContent'
import TroutTypeFilter from '../components/TroutTypeFilter'
import WaterBodyTypeFilter from '../components/WaterBodyTypeFilter'
import { filterByAlbertaRegions } from '../utils/albertaRegion'
import {
  filterByDistance,
  filterByTroutTypes,
  filterByWaterBodyTypes,
} from '../utils/fishWater'

const MAP_CENTER: [number, number] = [52.5, -114.5]

export default function MapPage() {
  const [referenceCity, setReferenceCity] = useState<ReferenceCity>('calgary')
  const [maxDistance, setMaxDistance] = useState<number | null>(null)
  const [selectedTrout, setSelectedTrout] = useState<TroutTypeKey[]>([])
  const [selectedTypes, setSelectedTypes] = useState<WaterBodyType[]>([])
  const [selectedRegions, setSelectedRegions] = useState<AlbertaRegion[]>([])

  const filteredWaters = useMemo(() => {
    let result = filterByDistance(fishWaters, referenceCity, maxDistance)
    result = filterByWaterBodyTypes(result, selectedTypes)
    result = filterByAlbertaRegions(result, selectedRegions)
    result = filterByTroutTypes(result, selectedTrout)
    return result
  }, [referenceCity, maxDistance, selectedTypes, selectedRegions, selectedTrout])

  return (
    <div className="page map-page">
      <section className="page-hero page-hero--compact">
        <h1>Water Body Map</h1>
        <p>Click a marker to see population stats and jump to full details.</p>
      </section>

      <section className="controls-panel map-controls">
        <DistanceFilter
          city={referenceCity}
          onCityChange={setReferenceCity}
          maxDistance={maxDistance}
          onMaxDistanceChange={setMaxDistance}
        />

        <WaterBodyTypeFilter
          selected={selectedTypes}
          onChange={setSelectedTypes}
        />

        <AlbertaRegionFilter
          selected={selectedRegions}
          onChange={setSelectedRegions}
        />

        <TroutTypeFilter
          selected={selectedTrout}
          onChange={setSelectedTrout}
        />
      </section>

      <p className="results-count">
        Showing {filteredWaters.length} marker
        {filteredWaters.length !== 1 ? 's' : ''}
      </p>

      <div className="map-container">
        <MapContainer
          center={MAP_CENTER}
          zoom={7}
          scrollWheelZoom
          className="leaflet-map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filteredWaters.map((water) => (
            <Marker
              key={water.id}
              position={[water.location.latitude, water.location.longitude]}
            >
              <Popup>
                <MapPopupContent water={water} referenceCity={referenceCity} />
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
