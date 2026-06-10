import type {
  FishTypeKey,
  ReferenceCity,
  SortDirection,
  SortField,
  WaterBodyType,
} from '../types/fishWater'
import DifficultyFilter from './DifficultyFilter'
import DistanceFilter from './DistanceFilter'
import FilterSection from './FilterSection'
import SortControls from './SortControls'
import TroutTypeFilter from './TroutTypeFilter'
import WaterBodyTypeFilter from './WaterBodyTypeFilter'
import WaterSearchBar from './WaterSearchBar'

interface HomeFiltersPanelProps {
  searchQuery: string
  onSearchQueryChange: (value: string) => void
  searchResultCount: number
  searchTotalCount: number
  referenceCity: ReferenceCity
  onReferenceCityChange: (city: ReferenceCity) => void
  maxDistance: number
  onMaxDistanceChange: (distance: number) => void
  sortField: SortField
  sortDirection: SortDirection
  onSortFieldChange: (field: SortField) => void
  onSortDirectionChange: (direction: SortDirection) => void
  selectedTypes: WaterBodyType[]
  onSelectedTypesChange: (types: WaterBodyType[]) => void
  selectedTrout: FishTypeKey[]
  onSelectedTroutChange: (types: FishTypeKey[]) => void
  selectedDifficulties: number[]
  onSelectedDifficultiesChange: (levels: number[]) => void
}

export default function HomeFiltersPanel({
  searchQuery,
  onSearchQueryChange,
  searchResultCount,
  searchTotalCount,
  referenceCity,
  onReferenceCityChange,
  maxDistance,
  onMaxDistanceChange,
  sortField,
  sortDirection,
  onSortFieldChange,
  onSortDirectionChange,
  selectedTypes,
  onSelectedTypesChange,
  selectedTrout,
  onSelectedTroutChange,
  selectedDifficulties,
  onSelectedDifficultiesChange,
}: HomeFiltersPanelProps) {
  return (
    <section className="filters-panel" aria-label="Search and filters">
      <div className="filters-panel__search">
        <WaterSearchBar
          value={searchQuery}
          onChange={onSearchQueryChange}
          resultCount={searchResultCount}
          totalCount={searchTotalCount}
        />
      </div>

      <div className="filters-panel__sort">
        <FilterSection title="Sort" alwaysOpen>
          <SortControls
            field={sortField}
            direction={sortDirection}
            onFieldChange={onSortFieldChange}
            onDirectionChange={onSortDirectionChange}
            hideLabel
          />
        </FilterSection>
      </div>

      <div className="filters-panel__grid">
        <FilterSection title="By distance">
          <DistanceFilter
            city={referenceCity}
            onCityChange={onReferenceCityChange}
            maxDistance={maxDistance}
            onMaxDistanceChange={onMaxDistanceChange}
            hideLabel
          />
        </FilterSection>

        <FilterSection title="Water body type">
          <WaterBodyTypeFilter
            selected={selectedTypes}
            onChange={onSelectedTypesChange}
            hideLabel
          />
        </FilterSection>

        <FilterSection title="Difficulty">
          <DifficultyFilter
            selected={selectedDifficulties}
            onChange={onSelectedDifficultiesChange}
            hideLabel
          />
        </FilterSection>

        <FilterSection title="Fish species">
          <TroutTypeFilter
            selected={selectedTrout}
            onChange={onSelectedTroutChange}
            hideLabel
          />
        </FilterSection>
      </div>
    </section>
  )
}
