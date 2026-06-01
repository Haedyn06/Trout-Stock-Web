import { useEffect, useRef } from 'react'
import { Marker, Popup, useMap } from 'react-leaflet'
import type L from 'leaflet'
import type { FishWater, ReferenceCity } from '../types/fishWater'
import MapPopupContent from './MapPopupContent'

const FOCUS_ZOOM = 11

function MapFlyTo({ water }: { water: FishWater }) {
  const map = useMap()

  useEffect(() => {
    map.flyTo([water.location.latitude, water.location.longitude], FOCUS_ZOOM, {
      duration: 0.75,
    })
  }, [map, water])

  return null
}

interface FocusedWaterMarkerProps {
  water: FishWater
  referenceCity: ReferenceCity
}

export default function FocusedWaterMarker({
  water,
  referenceCity,
}: FocusedWaterMarkerProps) {
  const markerRef = useRef<L.Marker>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => markerRef.current?.openPopup(), 500)
    return () => window.clearTimeout(timer)
  }, [water.id])

  return (
    <>
      <MapFlyTo water={water} />
      <Marker
        ref={markerRef}
        position={[water.location.latitude, water.location.longitude]}
      >
        <Popup>
          <MapPopupContent water={water} referenceCity={referenceCity} />
        </Popup>
      </Marker>
    </>
  )
}
