import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  FishTypeKey,
  ReferenceCity,
  SortDirection,
  SortField,
} from '../types/fishWater'
import { DEFAULT_DISTANCE_KM, DEFAULT_SORT_DIRECTION } from '../types/fishWater'

export interface HomeListState {
  referenceCity: ReferenceCity
  maxDistance: number
  sortField: SortField
  sortDirection: SortDirection
  selectedTrout: FishTypeKey[]
  searchQuery: string
  page: number
}

export function createDefaultHomeListState(): HomeListState {
  return {
    referenceCity: 'calgary',
    maxDistance: DEFAULT_DISTANCE_KM,
    sortField: 'latestStocked',
    sortDirection: DEFAULT_SORT_DIRECTION.latestStocked,
    selectedTrout: [],
    searchQuery: '',
    page: 1,
  }
}

interface HomeListStateContextValue {
  state: HomeListState
  setState: React.Dispatch<React.SetStateAction<HomeListState>>
  resetHomeListState: () => void
}

const HomeListStateContext = createContext<HomeListStateContextValue | null>(null)

export function HomeListStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(createDefaultHomeListState)

  const resetHomeListState = useCallback(() => {
    setState(createDefaultHomeListState())
  }, [])

  const value = useMemo(
    () => ({ state, setState, resetHomeListState }),
    [state, resetHomeListState],
  )

  return (
    <HomeListStateContext.Provider value={value}>
      {children}
    </HomeListStateContext.Provider>
  )
}

export function useHomeListState() {
  const context = useContext(HomeListStateContext)
  if (!context) {
    throw new Error('useHomeListState must be used within HomeListStateProvider')
  }
  return context
}
