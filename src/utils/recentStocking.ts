import type { FishTypeKey, FishWater } from '../types/fishWater'
import { formatDate, formatNumber, getFishTypeLabel } from './fishWater'

export interface StockingAnnouncement {
  id: string
  waterId: string
  stockDate: string
  amountPopulated: number
  speciesLabel: string
  waterBodyName: string
  label: string
}

export function getRecentStockingAnnouncements(
  waters: FishWater[],
  fromDate: string,
  toDate: string,
): StockingAnnouncement[] {
  const announcements: StockingAnnouncement[] = []

  for (const water of waters) {
    for (const [index, log] of water.logs.entries()) {
      if (log.stockDate < fromDate || log.stockDate > toDate) {
        continue
      }

      const speciesLabel = getFishTypeLabel(log.typeOfFish as FishTypeKey)
      const displayDate = formatDate(log.stockDate)

      announcements.push({
        id: `${water.id}-${log.stockDate}-${log.typeOfFish}-${index}`,
        waterId: water.id,
        stockDate: log.stockDate,
        amountPopulated: log.amountPopulated,
        speciesLabel,
        waterBodyName: water.waterBodyName,
        label: `${displayDate}, ${formatNumber(log.amountPopulated)} ${speciesLabel} Stocked @ ${water.waterBodyName}`,
      })
    }
  }

  return announcements.sort((a, b) => {
    const dateCompare = b.stockDate.localeCompare(a.stockDate)
    if (dateCompare !== 0) return dateCompare
    return a.waterBodyName.localeCompare(b.waterBodyName)
  })
}
