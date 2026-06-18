import { Link } from 'react-router-dom'
import type { FishWater, ReferenceCity } from '../types/fishWater'
import ExternalMapLinks from './ExternalMapLinks'
import FishTypeList from './FishTypeList'
import {
  formatDate,
  formatNumber,
} from '../utils/fishWater'
import { distanceFromCity, formatDistance, getCityLabel } from '../utils/distance'

interface WaterCardProps {
  water: FishWater
  referenceCity: ReferenceCity
}

export default function WaterCard({ water, referenceCity }: WaterCardProps) {
  const distance = distanceFromCity(water, referenceCity)

  return (
    <article className="water-card">
      <div className="water-card-header">
        <div>
          <h2>{water.waterBodyName}</h2>
          <p className="water-location">{water.location.name}</p>
        </div>
      </div>

      <div className="water-card-stats">
        <div className="stat">
          <span className="stat-label">Total Populated</span>
          <span className="stat-value">
            {formatNumber(water.population)}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Avg Length</span>
          <span className="stat-value">{water.avgLength} cm</span>
        </div>
        <div className="stat">
          <span className="stat-label">Latest Stocked</span>
          <span className="stat-value">{formatDate(water.latestStockDate)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">From {getCityLabel(referenceCity)}</span>
          <span className="stat-value">{formatDistance(distance)}</span>
        </div>
      </div>

      <div className="water-card-fish">
        <h3>Fish Types</h3>
        <FishTypeList water={water} compact />
      </div>

      <ExternalMapLinks water={water} compact />

      <Link to={`/water/${water.id}`} className="btn btn-primary">
        View Details
      </Link>
    </article>
  )
}
