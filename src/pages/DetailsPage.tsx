import { Link, useParams } from 'react-router-dom'
import { getFishWaterById } from '../data/loadFishWaters'
import { ALL_FISH_TYPES, type FishTypeKey } from '../types/fishWater'
import ExternalMapLinks from '../components/ExternalMapLinks'
import {
  formatDate,
  formatNumber,
  getFishTypeLabel,
} from '../utils/fishWater'

export default function DetailsPage() {
  const { id } = useParams<{ id: string }>()
  const water = id ? getFishWaterById(id) : undefined

  if (!water) {
    return (
      <div className="page details-page">
        <div className="empty-state">
          <h1>Water Body Not Found</h1>
          <p>The requested water body does not exist in the dataset.</p>
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const sortedLogs = [...water.logs].sort(
    (a, b) => new Date(b.stockDate).getTime() - new Date(a.stockDate).getTime(),
  )

  return (
    <div className="page details-page">
      <Link to="/" className="back-link">
        ← Back to all waters
      </Link>

      <header className="details-header">
        <div>
          <h1>{water.waterBodyName}</h1>
          <p className="water-location">{water.location.name}</p>
          <p className="coordinates">
            {water.location.latitude.toFixed(4)}°N,{' '}
            {Math.abs(water.location.longitude).toFixed(4)}°W
          </p>
        </div>
      </header>

      <section className="details-overview">
        <h2>Overview</h2>
        <div className="overview-grid">
          <div className="overview-card">
            <span className="overview-label">Total Populated</span>
            <span className="overview-value">
              {formatNumber(water.population)}
            </span>
          </div>
          <div className="overview-card">
            <span className="overview-label">Average Length</span>
            <span className="overview-value">{water.avgLength} cm</span>
          </div>
          <div className="overview-card">
            <span className="overview-label">Latest Stock Date</span>
            <span className="overview-value">
              {formatDate(water.latestStockDate)}
            </span>
          </div>
        </div>
      </section>

      <section className="details-fish">
        <h2>Fish Types</h2>
        <div className="fish-table-wrap">
          <table className="fish-table">
            <thead>
              <tr>
                <th>Species</th>
                <th>Population</th>
                <th>Avg Length</th>
                <th>Last Populated</th>
              </tr>
            </thead>
            <tbody>
              {ALL_FISH_TYPES.map(({ key, label }) => {
                const stats = water.fishTypes[key]
                return (
                  <tr key={key} className={stats.population === 0 ? 'inactive' : ''}>
                    <td>{label}</td>
                    <td>{stats.population > 0 ? formatNumber(stats.population) : '—'}</td>
                    <td>{stats.avgLength > 0 ? `${stats.avgLength} cm` : '—'}</td>
                    <td>{formatDate(stats.lastPopulatedDate)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="details-logs">
        <h2>Stocking Logs 2026</h2>
        {sortedLogs.length === 0 ? (
          <p className="muted">No stocking records available.</p>
        ) : (
          <div className="logs-table-wrap">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Stock Date</th>
                  <th>Type of Fish</th>
                  <th>Amount Populated</th>
                </tr>
              </thead>
              <tbody>
                {sortedLogs.map((log, index) => (
                  <tr key={`${log.stockDate}-${log.typeOfFish}-${index}`}>
                    <td>{formatDate(log.stockDate)}</td>
                    <td>{getFishTypeLabel(log.typeOfFish as FishTypeKey)}</td>
                    <td>{formatNumber(log.amountPopulated)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="details-actions">
        <ExternalMapLinks water={water} />
        <Link to={`/map?water=${encodeURIComponent(water.id)}`} className="btn btn-secondary">
          View on Site Map
        </Link>
      </div>
    </div>
  )
}
