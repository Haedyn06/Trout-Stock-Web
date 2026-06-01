import fishWatersData from '../../datas/fish-waters.json'
import type { FishWater } from '../types/fishWater'

export const fishWaters: FishWater[] = fishWatersData as FishWater[]

export function getFishWaterById(id: string): FishWater | undefined {
  return fishWaters.find((w) => w.id === id)
}
