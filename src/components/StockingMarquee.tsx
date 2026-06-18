import { Fragment, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { fishWaters } from '../data/loadFishWaters'
import { siteMeta } from '../data/loadSiteMeta'
import type { StockingAnnouncement } from '../utils/recentStocking'
import { getRecentStockingAnnouncements } from '../utils/recentStocking'

function MarqueeDivider({ loop = false }: { loop?: boolean }) {
  return (
    <span
      className={`stocking-marquee__divider${loop ? ' stocking-marquee__divider--loop' : ''}`}
      aria-hidden="true"
    />
  )
}

function MarqueeContent({
  announcements,
}: {
  announcements: StockingAnnouncement[]
}) {
  return (
    <div className="stocking-marquee__content">
      {announcements.map((item, index) => (
        <Fragment key={item.id}>
          {index > 0 && <MarqueeDivider />}
          <Link
            to={`/water/${item.waterId}`}
            className="stocking-marquee__item"
          >
            {item.label}
          </Link>
        </Fragment>
      ))}
    </div>
  )
}

export default function StockingMarquee() {
  const announcements = useMemo(
    () =>
      getRecentStockingAnnouncements(
        fishWaters,
        siteMeta.recentStockingFrom,
        siteMeta.recentStockingTo,
      ),
    [],
  )

  if (announcements.length === 0) {
    return null
  }

  return (
    <aside className="stocking-marquee" aria-label="Recent stocking updates">
      <div className="stocking-marquee__viewport">
        <div className="stocking-marquee__track">
          <MarqueeContent announcements={announcements} />
          <MarqueeDivider loop />
          <MarqueeContent announcements={announcements} />
        </div>
      </div>
    </aside>
  )
}
