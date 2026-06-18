import { useMemo, useRef } from 'react'
import { fishWaters } from '../data/loadFishWaters'
import HomeFiltersPanel from '../components/HomeFiltersPanel'
import Pagination from '../components/Pagination'
import WaterCard from '../components/WaterCard'
import { useHomeListState } from '../context/HomeListStateContext'
import {
  filterByDistance,
  filterBySearchQuery,
  filterByTroutTypes,
  sortWaters,
} from '../utils/fishWater'

const PAGE_SIZE = 9

export default function HomePage() {
  const { state, setState } = useHomeListState()
  const {
    referenceCity,
    maxDistance,
    sortField,
    sortDirection,
    selectedTrout,
    searchQuery,
    page,
  } = state
  const listRef = useRef<HTMLDivElement>(null)

  const filteredWaters = useMemo(() => {
    let filtered = filterBySearchQuery(fishWaters, searchQuery)
    filtered = filterByDistance(filtered, referenceCity, maxDistance)
    filtered = filterByTroutTypes(filtered, selectedTrout)
    return sortWaters(filtered, sortField, sortDirection, referenceCity)
  }, [
    searchQuery,
    referenceCity,
    maxDistance,
    selectedTrout,
    sortField,
    sortDirection,
  ])

  const totalPages = Math.max(1, Math.ceil(filteredWaters.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)

  const paginatedWaters = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredWaters.slice(start, start + PAGE_SIZE)
  }, [filteredWaters, currentPage])

  function resetPageAnd<K extends keyof typeof state>(key: K) {
    return (value: (typeof state)[K]) => {
      setState((prev) => ({ ...prev, [key]: value, page: 1 }))
    }
  }

  function handlePageChange(nextPage: number) {
    const clampedPage = Math.max(1, Math.min(nextPage, totalPages))
    setState((prev) => ({ ...prev, page: clampedPage }))
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
        <h1>Alberta Fishing Waters 2026 Report</h1>
        <p>
          Browse stocked lakes and rivers with population estimates and stocking
          history.
        </p>
      </section>

      <HomeFiltersPanel
        searchQuery={searchQuery}
        onSearchQueryChange={resetPageAnd('searchQuery')}
        searchResultCount={filteredWaters.length}
        searchTotalCount={fishWaters.length}
        referenceCity={referenceCity}
        onReferenceCityChange={resetPageAnd('referenceCity')}
        maxDistance={maxDistance}
        onMaxDistanceChange={resetPageAnd('maxDistance')}
        sortField={sortField}
        sortDirection={sortDirection}
        onSortFieldChange={resetPageAnd('sortField')}
        onSortDirectionChange={resetPageAnd('sortDirection')}
        selectedTrout={selectedTrout}
        onSelectedTroutChange={resetPageAnd('selectedTrout')}
      />

      <p className="results-count">
        {filteredWaters.length} of {fishWaters.length} water bodies match your filters
      </p>

      {filteredWaters.length === 0 ? (
        <div className="empty-state">
          <p>
            {searchQuery.trim()
              ? `No water bodies match "${searchQuery.trim()}".`
              : 'No water bodies match your filters.'}
          </p>
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
