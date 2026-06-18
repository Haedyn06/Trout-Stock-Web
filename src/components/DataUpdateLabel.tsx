import { siteMeta } from '../data/loadSiteMeta'
import { formatNumber } from '../utils/fishWater'

function formatDisplayDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function DataUpdateLabel() {
  const reportDate = formatDisplayDate(siteMeta.reportLastUpdated)

  return (
    <span className="data-update-label">
      Report last updated {reportDate}
      <span className="site-footer-sep"> · </span>
      {formatNumber(siteMeta.totalFishStocked)} fish stocked
      <span className="site-footer-sep"> · </span>
      {formatNumber(siteMeta.watersStocked)} lakes stocked
    </span>
  )
}
