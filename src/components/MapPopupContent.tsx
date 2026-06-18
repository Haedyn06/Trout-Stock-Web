import { Link } from 'react-router-dom'
import type { FishWater, ReferenceCity } from '../types/fishWater'
import ExternalMapLinks from './ExternalMapLinks'
import FishTypeList from './FishTypeList'
import { formatDate, formatNumber } from '../utils/fishWater'
import {
  distanceFromCity,
  formatDistanceFromCity,
} from '../utils/distance'

interface MapPopupContentProps {
  water: FishWater
  referenceCity: ReferenceCity
}

export default function MapPopupContent({
  water,
  referenceCity,
}: MapPopupContentProps) {
  const distance = distanceFromCity(water, referenceCity)

  return (
    <div className="map-popup">
      <h3>{water.waterBodyName}</h3>
      <p className="map-popup-location">{water.location.name}</p>
      <p className="map-popup-distance">
        {formatDistanceFromCity(distance, referenceCity)}
      </p>

      <div className="map-popup-stats">
        <div>
          <span className="label">Total Populated</span>
          <strong>{formatNumber(water.population)}</strong>
        </div>
        <div>
          <span className="label">Latest Update</span>
          <strong>{formatDate(water.latestStockDate)}</strong>
        </div>
      </div>

      <div className="map-popup-fish">
        <span className="label">Fish Types</span>
        <FishTypeList water={water} compact />
      </div>

      <ExternalMapLinks water={water} compact />

      <Link to={`/water/${water.id}`} className="btn btn-primary btn-sm map-popup-details-btn">
        View Details
      </Link>
    </div>
  )
}
