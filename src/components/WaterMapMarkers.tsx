import { Marker, Popup } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css'
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css'
import type { FishWater, ReferenceCity } from '../types/fishWater'
import MapPopupContent from './MapPopupContent'
import { createMapClusterIcon } from '../utils/mapClusterIcons'

interface WaterMapMarkersProps {
  waters: FishWater[]
  referenceCity: ReferenceCity
}

export default function WaterMapMarkers({ waters, referenceCity }: WaterMapMarkersProps) {
  return (
    <MarkerClusterGroup
      chunkedLoading
      showCoverageOnHover={false}
      spiderfyOnMaxZoom
      zoomToBoundsOnClick
      maxClusterRadius={60}
      disableClusteringAtZoom={13}
      iconCreateFunction={createMapClusterIcon}
    >
      {waters.map((water) => (
        <Marker
          key={water.id}
          position={[water.location.latitude, water.location.longitude]}
        >
          <Popup>
            <MapPopupContent water={water} referenceCity={referenceCity} />
          </Popup>
        </Marker>
      ))}
    </MarkerClusterGroup>
  )
}
