#!/usr/bin/env node
/**
 * Enriches fish-waters.json with coordinates and city distances.
 * Skips entries that already have lat/lng and both city distances filled in.
 *
 * Usage:
 *   node scripts/enrich-locations.mjs              # dry run (report only)
 *   node scripts/enrich-locations.mjs --write      # update fish-waters.json
 *   node scripts/enrich-locations.mjs --write --no-geocode  # ATS only, no web lookups
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_PATH = path.join(__dirname, '../datas/fish-waters.json')
const BACKUP_PATH = path.join(__dirname, '../datas/fish-waters.backup.json')
const CACHE_PATH = path.join(__dirname, '.geocode-cache.json')

/** Prefer ATS over web geocoding when the water name is ambiguous */
const ATS_FIRST_IDS = new Set(['spring_lake'])

const CALGARY = { lat: 51.0447, lng: -114.0719 }
const EDMONTON = { lat: 53.5461, lng: -113.4938 }

const MERIDIAN_LNG = {
  W4: -110.0,
  W5: -114.0,
  W6: -118.0,
}

const args = new Set(process.argv.slice(2))
const shouldWrite = args.has('--write')
const useGeocode = !args.has('--no-geocode')

function loadCache() {
  if (!fs.existsSync(CACHE_PATH)) return {}
  try {
    return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'))
  } catch {
    return {}
  }
}

function saveCache(cache) {
  fs.writeFileSync(CACHE_PATH, `${JSON.stringify(cache, null, 2)}\n`)
}

function isFullyFilled(water) {
  const { latitude, longitude, cityRange } = water.location
  return (
    latitude !== 0 &&
    longitude !== 0 &&
    cityRange.calgaryKMRange !== 0 &&
    cityRange.edmontonKMRange !== 0
  )
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const toRad = (d) => (d * Math.PI) / 180
  const r = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return r * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function roundKm(km) {
  return Math.round(km)
}

function computeCityRange(lat, lng) {
  return {
    calgaryKMRange: roundKm(haversineKm(lat, lng, CALGARY.lat, CALGARY.lng)),
    edmontonKMRange: roundKm(haversineKm(lat, lng, EDMONTON.lat, EDMONTON.lng)),
  }
}

function getSectionRowCol(section) {
  const row = Math.floor((section - 1) / 6)
  const positionInRow = (section - 1) % 6
  const col = row % 2 === 0 ? 5 - positionInRow : positionInRow
  return { row, col }
}

function quarterOffset(quarter) {
  switch (quarter.toUpperCase()) {
    case 'SW':
      return { eastMiles: 0.25, northMiles: 0.25 }
    case 'SE':
      return { eastMiles: 0.75, northMiles: 0.25 }
    case 'NW':
      return { eastMiles: 0.25, northMiles: 0.75 }
    case 'NE':
      return { eastMiles: 0.75, northMiles: 0.75 }
    default:
      return null
  }
}

/**
 * Parse Alberta legal land descriptions like NW11-49-18-W4
 * Format: QuarterSection-Township-Range-Meridian
 */
function parseLegalLandDescription(name) {
  const match = name.trim().match(/^([NSEW]{2})(\d+)-(\d+)-(\d+)-(W[456])$/i)
  if (!match) return null

  const [, quarter, sectionStr, townshipStr, rangeStr, meridian] = match
  const section = Number(sectionStr)
  const township = Number(townshipStr)
  const range = Number(rangeStr)

  if (
    section < 1 ||
    section > 36 ||
    township < 1 ||
    township > 126 ||
    range < 1 ||
    range > 30
  ) {
    return null
  }

  const meridianKey = meridian.toUpperCase()
  if (!MERIDIAN_LNG[meridianKey]) return null

  return {
    quarter: quarter.toUpperCase(),
    section,
    township,
    range,
    meridian: meridianKey,
  }
}

function atsToLatLng({ quarter, section, township, range, meridian }) {
  const qOffset = quarterOffset(quarter)
  if (!qOffset) return null

  const southLat = 49 + (township - 1) * (6 / 69.172)
  const milesPerDegreeLng = 69.172 * Math.cos((southLat * Math.PI) / 180)
  const westLng = MERIDIAN_LNG[meridian] - (range - 1) * (6 / milesPerDegreeLng)

  const { row, col } = getSectionRowCol(section)
  const lat = southLat + (row + qOffset.northMiles) / 69.172
  const lng = westLng - (col + qOffset.eastMiles) / milesPerDegreeLng

  return { lat, lng }
}

function isInAlberta(lat, lng) {
  return lat >= 48 && lat <= 61 && lng <= -110 && lng >= -120
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function geocodeWithNominatim(query) {
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', query)
  url.searchParams.set('format', 'json')
  url.searchParams.set('limit', '5')
  url.searchParams.set('countrycodes', 'ca')

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'StockFishStat/1.0 (location enrichment script)',
    },
  })

  if (response.status === 429) {
    await sleep(3000)
    throw new Error('Nominatim rate limited (429)')
  }

  if (!response.ok) {
    throw new Error(`Nominatim HTTP ${response.status}`)
  }

  const results = await response.json()
  if (!results.length) return null

  const preferred =
    results.find(
      (item) =>
        ['water', 'waterway', 'natural'].includes(item.class) ||
        ['lake', 'pond', 'reservoir', 'river', 'stream'].includes(item.type),
    ) ?? results[0]

  const lat = Number(preferred.lat)
  const lng = Number(preferred.lon)

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  if (!isInAlberta(lat, lng)) return null

  return { lat, lng, source: `nominatim:${query}` }
}

async function resolveCoordinates(water, cache) {
  const cacheKey = water.id
  if (cache[cacheKey] && !ATS_FIRST_IDS.has(water.id)) {
    return cache[cacheKey]
  }

  const { name: legalName } = water.location

  if (ATS_FIRST_IDS.has(water.id)) {
    const parsed = parseLegalLandDescription(legalName)
    if (parsed) {
      const coords = atsToLatLng(parsed)
      if (coords) {
        const result = {
          lat: coords.lat,
          lng: coords.lng,
          source: `ats:${legalName}`,
        }
        cache[cacheKey] = result
        return result
      }
    }
  }

  const nominatimQueries = useGeocode
    ? [
        `${water.waterBodyName}, Alberta, Canada`,
        `${water.waterBodyName}, Alberta`,
        `${legalName}, Alberta, Canada`,
      ]
    : []

  for (const query of nominatimQueries) {
    await sleep(1100)
    try {
      const result = await geocodeWithNominatim(query)
      if (result) {
        cache[cacheKey] = result
        return result
      }
    } catch (error) {
      console.warn(`  geocode failed for "${query}": ${error.message}`)
    }
  }

  const parsed = parseLegalLandDescription(legalName)
  if (parsed) {
    const coords = atsToLatLng(parsed)
    if (coords) {
      const result = {
        lat: coords.lat,
        lng: coords.lng,
        source: `ats:${legalName}`,
      }
      cache[cacheKey] = result
      return result
    }
  }

  return null
}

async function main() {
  const waters = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'))
  const cache = loadCache()
  const report = {
    skipped: [],
    updatedCoords: [],
    updatedDistances: [],
    failed: [],
  }

  let processed = 0
  const toProcess = waters.filter((w) => !isFullyFilled(w)).length

  for (const water of waters) {
    if (isFullyFilled(water)) {
      report.skipped.push(water.id)
      continue
    }

    processed++
    console.log(
      `[${processed}/${toProcess}] ${water.waterBodyName} (${water.id})`,
    )

    let { latitude, longitude } = water.location
    let coordsSource = null

    if (latitude === 0 && longitude === 0) {
      const resolved = await resolveCoordinates(water, cache)
      if (resolved) {
        latitude = Number(resolved.lat.toFixed(7))
        longitude = Number(resolved.lng.toFixed(7))
        coordsSource = resolved.source
        water.location.latitude = latitude
        water.location.longitude = longitude
        report.updatedCoords.push({
          id: water.id,
          name: water.waterBodyName,
          legal: water.location.name,
          latitude,
          longitude,
          source: coordsSource,
        })
      } else {
        report.failed.push({
          id: water.id,
          name: water.waterBodyName,
          legal: water.location.name,
          reason: 'Could not resolve coordinates',
        })
        continue
      }
    }

    const needsDistances =
      water.location.cityRange.calgaryKMRange === 0 ||
      water.location.cityRange.edmontonKMRange === 0

    if (needsDistances && latitude !== 0 && longitude !== 0) {
      const cityRange = computeCityRange(latitude, longitude)
      water.location.cityRange = cityRange
      report.updatedDistances.push({
        id: water.id,
        ...cityRange,
      })
    }
  }

  saveCache(cache)

  console.log('\n=== Location Enrichment Report ===')
  console.log(`Skipped (already complete): ${report.skipped.length}`)
  console.log(`Updated coordinates:        ${report.updatedCoords.length}`)
  console.log(`Updated city distances:     ${report.updatedDistances.length}`)
  console.log(`Failed:                     ${report.failed.length}`)

  if (report.failed.length > 0) {
    console.log('\nFailed entries:')
    for (const item of report.failed) {
      console.log(`  ${item.id} (${item.legal}): ${item.reason}`)
    }
  }

  if (shouldWrite) {
    if (!fs.existsSync(BACKUP_PATH)) {
      fs.copyFileSync(DATA_PATH, BACKUP_PATH)
      console.log(`\nBackup written to ${BACKUP_PATH}`)
    }
    fs.writeFileSync(DATA_PATH, `${JSON.stringify(waters, null, 2)}\n`)
    console.log(`Updated ${DATA_PATH}`)
  } else {
    console.log('\nDry run only. Re-run with --write to save changes.')
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
