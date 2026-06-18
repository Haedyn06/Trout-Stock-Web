import siteMetaData from '../../datas/site-meta.json'

export interface SiteMeta {
  dataFile: string
  reportSource: string
  reportLastUpdated: string
  totalFishStocked: number
  watersStocked: number
}

export const siteMeta: SiteMeta = siteMetaData as SiteMeta
