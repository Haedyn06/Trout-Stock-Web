export interface FishTypeStats {
  population: number
  avgLength: number
  lastPopulatedDate: string | null
}

export interface StockLog {
  stockDate: string
  typeOfFish: string
  amountPopulated: number
}

export interface WaterLocation {
  name: string
  latitude: number
  longitude: number
  cityRange: {
    calgaryKMRange: number
    edmontonKMRange: number
  }
}

export interface FishWater {
  id: string
  waterBodyName: string
  waterBodyType: WaterBodyType
  avgLength: number
  latestStockDate: string
  population: number
  difficulty: number
  location: WaterLocation
  fishTypes: {
    brookTrout: FishTypeStats
    brownTrout: FishTypeStats
    tigerTrout: FishTypeStats
    rainbowTrout: FishTypeStats
    cutthroatTrout: FishTypeStats
    walleye: FishTypeStats
  }
  logs: StockLog[]
}

export type TroutTypeKey =
  | 'brookTrout'
  | 'brownTrout'
  | 'tigerTrout'
  | 'rainbowTrout'
  | 'cutthroatTrout'

export type FishTypeKey = TroutTypeKey | 'walleye'

export type ReferenceCity =
  | 'calgary'
  | 'edmonton'
  | 'grandPrairie'
  | 'fortMcmurray'
  | 'lethbridge'
  | 'redDeer'

export const REFERENCE_CITIES: { value: ReferenceCity; label: string }[] = [
  { value: 'calgary', label: 'Calgary' },
  { value: 'edmonton', label: 'Edmonton' },
  { value: 'grandPrairie', label: 'Grand Prairie' },
  { value: 'fortMcmurray', label: 'Fort McMurray' },
  { value: 'lethbridge', label: 'Lethbridge' },
  { value: 'redDeer', label: 'Red Deer' },
]

export type WaterBodyType = 'lake' | 'river' | 'pond' | 'reservoir'

export const WATER_BODY_TYPES: WaterBodyType[] = [
  'lake',
  'river',
  'pond',
  'reservoir',
]

export const WATER_BODY_TYPE_LABELS: Record<WaterBodyType, string> = {
  lake: 'Lake',
  river: 'River',
  pond: 'Pond',
  reservoir: 'Reservoir',
}

export type AlbertaRegion = 'northeast' | 'northwest' | 'southeast' | 'southwest'

export const ALBERTA_REGIONS: { key: AlbertaRegion; label: string }[] = [
  { key: 'northeast', label: 'NE' },
  { key: 'northwest', label: 'NW' },
  { key: 'southeast', label: 'SE' },
  { key: 'southwest', label: 'SW' },
]

export type SortField =
  | 'name'
  | 'population'
  | 'difficulty'
  | 'latestStocked'
  | 'distance'

export type SortDirection = 'asc' | 'desc'

export const SORT_FIELDS: { value: SortField; label: string }[] = [
  { value: 'name', label: 'Water Body Name' },
  { value: 'population', label: 'Fish Population' },
  { value: 'difficulty', label: 'Difficulty' },
  { value: 'latestStocked', label: 'Latest Stocked' },
  { value: 'distance', label: 'Distance from City' },
]

export const DEFAULT_SORT_DIRECTION: Record<SortField, SortDirection> = {
  name: 'asc',
  population: 'desc',
  difficulty: 'asc',
  latestStocked: 'desc',
  distance: 'asc',
}

export const SORT_DIRECTION_LABELS: Record<SortDirection, string> = {
  asc: 'Ascending',
  desc: 'Descending',
}

export const TROUT_TYPES: { key: TroutTypeKey; label: string }[] = [
  { key: 'brookTrout', label: 'Brook Trout' },
  { key: 'brownTrout', label: 'Brown Trout' },
  { key: 'tigerTrout', label: 'Tiger Trout' },
  { key: 'rainbowTrout', label: 'Rainbow Trout' },
  { key: 'cutthroatTrout', label: 'Cutthroat Trout' },
]

export const ALL_FISH_TYPES: { key: FishTypeKey; label: string }[] = [
  ...TROUT_TYPES,
  { key: 'walleye', label: 'Walleye' },
]

/** Shows all waters — same behaviour as the former "Any distance" option. */
export const DEFAULT_DISTANCE_KM = 250

export const DISTANCE_OPTIONS = [
  { value: 25, label: 'Within 25 km' },
  { value: 50, label: 'Within 50 km' },
  { value: 75, label: 'Within 75 km' },
  { value: 100, label: 'Within 100 km' },
  { value: 150, label: 'Within 150 km' },
  { value: 200, label: 'Within 200 km' },
  { value: DEFAULT_DISTANCE_KM, label: 'Within 250km+' },
] as const

export const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'Easy',
  2: 'Fair',
  3: 'Moderate',
  4: 'Hard',
  5: 'Difficult',
}

export const MAX_DIFFICULTY = 5
