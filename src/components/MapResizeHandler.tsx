import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

interface MapResizeHandlerProps {
  active: boolean
}

export default function MapResizeHandler({ active }: MapResizeHandlerProps) {
  const map = useMap()

  useEffect(() => {
    const timer = window.setTimeout(() => map.invalidateSize(), 0)
    return () => window.clearTimeout(timer)
  }, [map, active])

  useEffect(() => {
    if (!active) {
      return
    }

    function onResize() {
      map.invalidateSize()
    }

    window.addEventListener('resize', onResize)
    window.visualViewport?.addEventListener('resize', onResize)
    window.visualViewport?.addEventListener('scroll', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      window.visualViewport?.removeEventListener('resize', onResize)
      window.visualViewport?.removeEventListener('scroll', onResize)
    }
  }, [map, active])

  return null
}
