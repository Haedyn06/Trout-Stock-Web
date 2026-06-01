import { useMemo, useRef, useState } from 'react'
import { fishWaters } from '../data/loadFishWaters'
import type {
  ReferenceCity,
  SortDirection,
  SortField,
  TroutTypeKey,
  WaterBodyType,
} from '../types/fishWater'
import { DEFAULT_SORT_DIRECTION } from '../types/fishWater'
import DistanceFilter from '../components/DistanceFilter'
import Pagination from '../components/Pagination'
import SortControls from '../components/SortControls'
import TroutTypeFilter from '../components/TroutTypeFilter'
import WaterBodyTypeFilter from '../components/WaterBodyTypeFilter'
import WaterCard from '../components/WaterCard'
import {
  filterByDistance,
  filterByTroutTypes,
  filterByWaterBodyTypes,
  sortWaters,
} from '../utils/fishWater'

const PAGE_SIZE = 9

export default function HomePage() {
  const [referenceCity, setReferenceCity] = useState<ReferenceCity>('calgary')
  const [maxDistance, setMaxDistance] = useState<number | null>(null)
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    DEFAULT_SORT_DIRECTION.name,
  )
  const [selectedTypes, setSelectedTypes] = useState<WaterBodyType[]>([])
  const [selectedTrout, setSelectedTrout] = useState<TroutTypeKey[]>([])
  const [page, setPage] = useState(1)
  const listRef = useRef<HTMLDivElement>(null)

  const filteredWaters = useMemo(() => {
    let filtered = filterByDistance(fishWaters, referenceCity, maxDistance)
    filtered = filterByWaterBodyTypes(filtered, selectedTypes)
    filtered = filterByTroutTypes(filtered, selectedTrout)
    return sortWaters(filtered, sortField, sortDirection, referenceCity)
  }, [referenceCity, maxDistance, selectedTypes, selectedTrout, sortField, sortDirection])

  const totalPages = Math.max(1, Math.ceil(filteredWaters.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)

  const paginatedWaters = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredWaters.slice(start, start + PAGE_SIZE)
  }, [filteredWaters, currentPage])

  function resetPageAnd<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value)
      setPage(1)
    }
  }

  function handlePageChange(nextPage: number) {
    const clampedPage = Math.max(1, Math.min(nextPage, totalPages))
    setPage(clampedPage)
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const paginationProps = {
    page: currentPage,
    totalPages,
    totalItems: filteredWaters.length,
    pageSize: PAGE_SIZE,
    onPageChange: handlePageChange,
  }

  return (
    <div className="page home-page">
      <section className="page-hero">
        <h1>Alberta Fishing Waters</h1>
        <p>
          Browse stocked lakes and rivers with population estimates, difficulty
          ratings, and stocking history.
        </p>
      </section>

      <section className="controls-panel">
        <DistanceFilter
          city={referenceCity}
          onCityChange={resetPageAnd(setReferenceCity)}
          maxDistance={maxDistance}
          onMaxDistanceChange={resetPageAnd(setMaxDistance)}
        />
        <SortControls
          field={sortField}
          direction={sortDirection}
          onFieldChange={resetPageAnd(setSortField)}
          onDirectionChange={resetPageAnd(setSortDirection)}
        />
        <WaterBodyTypeFilter
          selected={selectedTypes}
          onChange={resetPageAnd(setSelectedTypes)}
        />
        <TroutTypeFilter
          selected={selectedTrout}
          onChange={resetPageAnd(setSelectedTrout)}
        />
      </section>

      <p className="results-count">
        {filteredWaters.length} of {fishWaters.length} water bodies match your filters
      </p>

      {filteredWaters.length === 0 ? (
        <div className="empty-state">
          <p>No water bodies match your filters.</p>
        </div>
      ) : (
        <>
          <div ref={listRef} className="list-section">
            <div className="water-grid">
              {paginatedWaters.map((water) => (
                <WaterCard
                  key={water.id}
                  water={water}
                  referenceCity={referenceCity}
                />
              ))}
            </div>

            <Pagination {...paginationProps} />
          </div>
        </>
      )}
    </div>
  )
}
