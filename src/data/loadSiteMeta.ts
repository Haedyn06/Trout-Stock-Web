import siteMetaData from '../../datas/site-meta.json'

export interface SiteMeta {
  dataFile: string
  reportSource: string
  reportLastUpdated: string
}

export const siteMeta: SiteMeta = siteMetaData as SiteMeta
