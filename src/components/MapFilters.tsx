import type { AlbertaRegion, FishTypeKey, ReferenceCity, WaterBodyType } from '../types/fishWater'
import AlbertaRegionFilter from './AlbertaRegionFilter'
import DistanceFilter from './DistanceFilter'
import FilterSection from './FilterSection'
import TroutTypeFilter from './TroutTypeFilter'
import WaterBodyTypeFilter from './WaterBodyTypeFilter'

export interface MapFiltersProps {
  referenceCity: ReferenceCity
  onReferenceCityChange: (city: ReferenceCity) => void
  maxDistance: number
  onMaxDistanceChange: (distance: number) => void
  selectedTypes: WaterBodyType[]
  onSelectedTypesChange: (types: WaterBodyType[]) => void
  selectedRegions: AlbertaRegion[]
  onSelectedRegionsChange: (regions: AlbertaRegion[]) => void
  selectedTrout: FishTypeKey[]
  onSelectedTroutChange: (types: FishTypeKey[]) => void
}

export default function MapFilters({
  referenceCity,
  onReferenceCityChange,
  maxDistance,
  onMaxDistanceChange,
  selectedTypes,
  onSelectedTypesChange,
  selectedRegions,
  onSelectedRegionsChange,
  selectedTrout,
  onSelectedTroutChange,
}: MapFiltersProps) {
  return (
    <div className="filters-panel__grid filters-panel__grid--map">
      <FilterSection title="Fish species">
        <TroutTypeFilter
          selected={selectedTrout}
          onChange={onSelectedTroutChange}
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

      <FilterSection title="Alberta region">
        <AlbertaRegionFilter
          selected={selectedRegions}
          onChange={onSelectedRegionsChange}
          hideLabel
        />
      </FilterSection>

      <FilterSection title="By distance" alwaysOpen>
        <DistanceFilter
          city={referenceCity}
          onCityChange={onReferenceCityChange}
          maxDistance={maxDistance}
          onMaxDistanceChange={onMaxDistanceChange}
          hideLabel
        />
      </FilterSection>
    </div>
  )
}
