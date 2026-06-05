import L from 'leaflet'

interface MapMarkerCluster {
  getChildCount(): number
}

function clusterSizeClass(count: number) {
  if (count < 10) {
    return 'map-marker-cluster--sm'
  }

  if (count < 50) {
    return 'map-marker-cluster--md'
  }

  if (count < 100) {
    return 'map-marker-cluster--lg'
  }

  return 'map-marker-cluster--xl'
}

export function createMapClusterIcon(cluster: MapMarkerCluster) {
  const count = cluster.getChildCount()
  const sizeClass = clusterSizeClass(count)

  return L.divIcon({
    html: `<span class="map-marker-cluster__count">${count}</span>`,
    className: `map-marker-cluster ${sizeClass}`,
    iconSize: L.point(48, 48, true),
  })
}
