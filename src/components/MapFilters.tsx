import type { AlbertaRegion, ReferenceCity, TroutTypeKey, WaterBodyType } from '../types/fishWater'
import AlbertaRegionFilter from './AlbertaRegionFilter'
import DistanceFilter from './DistanceFilter'
import TroutTypeFilter from './TroutTypeFilter'
import WaterBodyTypeFilter from './WaterBodyTypeFilter'

export interface MapFiltersProps {
  referenceCity: ReferenceCity
  onReferenceCityChange: (city: ReferenceCity) => void
  maxDistance: number | null
  onMaxDistanceChange: (distance: number | null) => void
  selectedTypes: WaterBodyType[]
  onSelectedTypesChange: (types: WaterBodyType[]) => void
  selectedRegions: AlbertaRegion[]
  onSelectedRegionsChange: (regions: AlbertaRegion[]) => void
  selectedTrout: TroutTypeKey[]
  onSelectedTroutChange: (types: TroutTypeKey[]) => void
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
    <>
      <DistanceFilter
        city={referenceCity}
        onCityChange={onReferenceCityChange}
        maxDistance={maxDistance}
        onMaxDistanceChange={onMaxDistanceChange}
      />

      <WaterBodyTypeFilter selected={selectedTypes} onChange={onSelectedTypesChange} />

      <AlbertaRegionFilter selected={selectedRegions} onChange={onSelectedRegionsChange} />

      <TroutTypeFilter selected={selectedTrout} onChange={onSelectedTroutChange} />
    </>
  )
}
