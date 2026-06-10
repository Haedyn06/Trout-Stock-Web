#!/usr/bin/env node
/**
 * Sync coordinates from My Wild Alberta stocking maps into fish-waters.json.
 *
 * Source: https://mywildalberta.ca/fishing/fish-stocking/stocking-maps.aspx
 *
 * Usage:
 *   node scripts/sync-mwa-coordinates.mjs              # dry run
 *   node scripts/sync-mwa-coordinates.mjs --write    # update fish-waters.json
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_PATH = path.join(__dirname, '../datas/fish-waters.json')
const CACHE_PATH = path.join(__dirname, '.mwa-coords-cache.json')

const LISTING_URL =
  'https://mywildalberta.ca/fishing/fish-stocking/stocking-maps.aspx/data/stocking-maps.aspx?listing=1'
const DETAIL_URL = (id) =>
  `https://mywildalberta.ca/fishing/fish-stocking/stocking-maps.aspx?id=${id}`

const CALGARY = { lat: 51.0447, lng: -114.0719 }
const EDMONTON = { lat: 53.5461, lng: -113.4938 }

const shouldWrite = process.argv.includes('--write')
const CONCURRENCY = 8
const FETCH_DELAY_MS = 120

/** Our waterBodyName -> exact MWA listing name when auto-match is unreliable */
const MANUAL_ALIASES = {
  'Blood Indian Creek': 'Blood Indian Creek Reservoir',
  'Bonnyville Town Pond': 'Bonnyville Town Pond (Slawuta Lake)',
  'Captain Eyre Lake (Capt)': 'Captain Ayre Lake',
  'Chain Lakes (Lower Chain)': 'Lower Chain Lakes',
  'Claude N. Brennan': 'Claude N Bernnan Memorial Pond (Vermillion Park',
  'County Sportplex Pond': 'County Sportsplex Pond',
  'Dolberg Lake': 'Doleberg Lake',
  'Emerson Lake': 'Emerson Lakes',
  'Enchant Pond': 'Enchant Park Pond',
  'Gibbons Pond': 'Gibbons Park Pond',
  'Goldspring Park Pond': 'Gold Spring Park Pond',
  'Heritage Lake': 'Heritage Pond',
  'Hermitage Park Pond': 'Hermitage Lake',
  'High Level Community': 'High Level Community Pond',
  "Hiller's Reservoir": "Hiller's (Dam) Reservoir",
  'Hinton F & G Pond (Hinton)': 'Hinton Fish and Game Pond (Cold Creek Trout Pond)',
  'Kraft Wimborne Pond': 'Kraft Winborne Pond',
  'Little Bear Lake (Hasse)': 'Little Bear Lake (Hasse Lake)',
  'Lloydminster Pond': 'Lloydminster Trout Pond',
  'McLeod Lake (Carson)': 'McLeod (Carson) Lake',
  'Michel Reservoir (Michel)': 'Michel Reservoir',
  'Mitchell Pond (Waskasoo)': 'Mitchell Pond (Waskasoo Park Pond)',
  'Mitford Ponds': 'Mitford Pond',
  'Montaganeusse Lake': 'Montagneuse Lake (Stony Lake)',
  'Moonshine Lake (Mirage)': 'Moonshine (Mirage) Lake',
  'Morinville Fish And Game': 'Morinville Fish and Game Pond',
  "Niemela Reservoir (Ray's)": "Niemela Reservoir (Ray's Pond)",
  'Nose Creek Pond': 'Nose Creek',
  'Oyen (Concrete Plant)': 'Oyen (Concrete Plant Pond)',
  'Parlby Reservoir (Tees)': 'Parlby Reservoir (Tees Fish Pond)',
  'Payne Lake (Mami Lake)': 'Payne (Mami) Lake',
  'Pit 24': 'Pit 24 Lake',
  'Pit 35': 'Pit 35 Lake',
  'Pit 44': 'Pit 44 Lake',
  'Pit 45': 'Pit 45 Lake',
  'Pleasure Island Reservoir': 'Pleasure Island Reservoir (Twomey)',
  'Ponoka Centennial Park': 'Ponoka Centennial Park Pond',
  'Rainbow Park Pond': 'Rainbow Park Pond (Westlock Recreation Pond)',
  'Spring Lake (Cottage)': 'Spring (Cottage) Lake ',
  'Two Hills Pond': 'Two Hills Trout Pond',
  'West Rivers Edge Pond': 'West Rivers Edge Pond (Fort Lions Park Pond)',
  'Whiteridge Recreation Area': 'Whiteridge Recreational Area Pond (Blueridge Pit)',
  'Wildhorse Lakes (Lower)': 'Lower Wildhorse Lakes',
  'Wildhorse Lakes (Upper)': 'Upper Wildhorse Lakes ',
  'Wildwood Pond': 'Wildwood Pond (Stones Pond)',
  'Champion Lakes (Lower)': 'Champion Lakes Lower',
  'Champion Lakes (Upper)': 'Champion Lakes Upper',
  'Magrath Childrens Pond': "Magrath Children's Pond",
  "Pierre Greys Lakes (Lower)": 'Pierre Greys Lakes (Lower) #1',
  'Pierre Greys Lakes (Middle)': 'Pierre Greys Lakes (Middle) #2',
  'Pierre Greys Lakes (Upper)': 'Pierre Greys Lakes (Upper) #3',
  "Sparrow's Egg Lake": 'Sparrows Egg Lake',
  "Stirling Children's Pond": "Stirling Children's Pond",
  'Twin Lakes (East Twin)': 'East Twin Lake',
}

/** water id -> MWA listing id when name matching is unreliable */
const MANUAL_MWA_IDS = {
  birch_lake: '4061',
  champion_lakes_lower: '6607',
  champion_lakes_upper: '6608',
  magrath_childrens_pond: '317719',
  margaret_lake: '5223',
  mary_gregg_lake: '5245',
  pierre_greys_lakes_lower: '6534',
  pierre_greys_lakes_middle: '6533',
  pierre_greys_lakes_upper: '5572',
  rocky_childrens_pond: '3485',
  sparrows_egg_lake: '5858',
  stirling_childrens_pond: '6682',
  taber_trout_pond: '318138',
  tay_lake: '5968',
  twin_lakes_east_twin: '6044',
  victor_lake: '6086',
  yellowhead_lake: '6601',
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

function computeCityRange(lat, lng) {
  return {
    calgaryKMRange: Math.round(haversineKm(lat, lng, CALGARY.lat, CALGARY.lng)),
    edmontonKMRange: Math.round(haversineKm(lat, lng, EDMONTON.lat, EDMONTON.lng)),
  }
}

function normalize(name) {
  return name
    .toLowerCase()
    .replace(/[''`]/g, "'")
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9()'\s#]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function stripTypes(s) {
  return s
    .replace(
      /\b(reservoir|lake|lakes|pond|ponds|creek|river|pit|park|community|area|recreational|recreation|trout|fish and game|memorial|borrow pit)\b/g,
      ' ',
    )
    .replace(/\s+/g, ' ')
    .trim()
}

function nameVariants(name) {
  const variants = new Set()
  const n = normalize(name)
  variants.add(n)
  variants.add(stripTypes(n))

  const paren = n.match(/^(.+?)\s*\(([^)]+)\)\s*(.*)$/)
  if (paren) {
    const [, before, inside, after] = paren
    const base = normalize(`${before} ${after}`)
    variants.add(base)
    variants.add(stripTypes(base))
    variants.add(normalize(inside))
    variants.add(stripTypes(inside))
    variants.add(normalize(`${inside} ${before} ${after}`))
    variants.add(normalize(`${before} (${inside}) ${after}`))
  }

  const lowerUpper = n.match(/^(lower|upper)\s+(.+)$/)
  if (lowerUpper) {
    variants.add(normalize(`${lowerUpper[2]} (${lowerUpper[1]})`))
    variants.add(normalize(`${lowerUpper[2]} (${lowerUpper[1]} ${lowerUpper[2].includes('lake') ? '' : 'chain'})`))
  }

  const parenLU = n.match(/^(.+?)\s*\((lower|upper)([^)]*)\)\s*$/)
  if (parenLU) {
    variants.add(normalize(`${parenLU[2]} ${parenLU[1]}`))
  }

  const swapped = n.match(/^(.+?)\s*\(([^)]+)\)\s+(lake|pond|reservoir|creek)$/i)
  if (swapped) {
    variants.add(normalize(`${swapped[1]} ${swapped[3]} (${swapped[2]})`))
    variants.add(normalize(`${swapped[2]} (${swapped[1]}) ${swapped[3]}`))
  }

  return [...variants].filter(Boolean)
}

function parseListing(html) {
  const entries = []

  const htmlRe =
    /<a\s+href=['"]stocking-maps\.aspx\?id=(\d+)['"][^>]*>([^<]+)<\/a>/gi
  let match
  while ((match = htmlRe.exec(html)) !== null) {
    entries.push({ name: match[2].trim(), id: match[1] })
  }

  if (entries.length > 0) return entries

  const mdRe = /\|\[([^\]]+)\]\(stocking-maps\.aspx\?id=(\d+)\)/g
  while ((match = mdRe.exec(html)) !== null) {
    entries.push({ name: match[1].trim(), id: match[2] })
  }

  return entries
}

function buildLookup(mwaEntries) {
  const byExact = new Map()
  const byVariant = new Map()

  for (const entry of mwaEntries) {
    byExact.set(normalize(entry.name), entry)
    for (const variant of nameVariants(entry.name)) {
      if (!byVariant.has(variant)) byVariant.set(variant, entry)
    }
  }

  return { byExact, byVariant, mwaEntries }
}

function findMwaMatch(waterName, lookup) {
  const manual = MANUAL_ALIASES[waterName]
  if (manual) {
    const exact = lookup.byExact.get(normalize(manual))
    if (exact) return { entry: exact, method: 'manual' }
  }

  const exact = lookup.byExact.get(normalize(waterName))
  if (exact) return { entry: exact, method: 'exact' }

  for (const variant of nameVariants(waterName)) {
    const hit = lookup.byVariant.get(variant)
    if (hit) return { entry: hit, method: `variant:${variant}` }
  }

  return null
}

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

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'StockFishStat/1.0 (coordinate sync)' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.text()
}

function isValidAlbertaCoord(lat, lng) {
  return lat >= 48 && lat <= 61 && lng <= -109 && lng >= -120
}

/** MWA occasionally omits the hundreds digit in longitude (e.g. -11.57 → -115.57). */
function normalizeCoords(latitude, longitude) {
  if (isValidAlbertaCoord(latitude, longitude)) {
    return { latitude, longitude }
  }

  if (latitude >= 48 && latitude <= 61 && longitude < 0 && longitude > -109) {
    const correctedLng = longitude - 104
    if (isValidAlbertaCoord(latitude, correctedLng)) {
      return { latitude, longitude: correctedLng }
    }
  }

  return null
}

function parseCoords(html) {
  const match = html.match(
    /Location:\s*<\/strong>\s*(-?\d+(?:\.\d+)?)(?:&nbsp;|\s)+(-?\d+(?:\.\d+)?)/i,
  )
  if (match) {
    return normalizeCoords(Number(match[1]), Number(match[2]))
  }

  const plain = html.match(/Location:\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/i)
  if (!plain) return null
  return normalizeCoords(Number(plain[1]), Number(plain[2]))
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchCoordsForIds(ids, cache) {
  const results = new Map()
  const queue = [...new Set(ids)]

  async function worker() {
    while (queue.length > 0) {
      const id = queue.shift()
      if (results.has(id)) continue

      if (cache[id]) {
        const normalized = normalizeCoords(cache[id].latitude, cache[id].longitude)
        if (normalized) {
          cache[id] = normalized
          results.set(id, normalized)
        }
        continue
      }

      await sleep(FETCH_DELAY_MS)
      try {
        const html = await fetchText(DETAIL_URL(id))
        const coords = parseCoords(html)
        if (coords) {
          cache[id] = coords
          results.set(id, coords)
        } else {
          results.set(id, null)
          console.warn(`  No coordinates on MWA page for id=${id}`)
        }
      } catch (err) {
        console.warn(`  Failed id=${id}: ${err.message}`)
        results.set(id, null)
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()))
  return results
}

async function main() {
  console.log('Fetching My Wild Alberta listing...')
  const listingHtml = await fetchText(LISTING_URL)
  const mwaEntries = parseListing(listingHtml)
  console.log(`Found ${mwaEntries.length} MWA water bodies`)

  const lookup = buildLookup(mwaEntries)
  const waters = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'))

  const matches = []
  const unmatched = []

  for (const water of waters) {
    const manualId = MANUAL_MWA_IDS[water.id]
    if (manualId) {
      const entry = lookup.mwaEntries.find((item) => item.id === manualId)
      if (entry) {
        matches.push({ water, mwa: entry, method: 'manual-id' })
        continue
      }
    }

    const hit = findMwaMatch(water.waterBodyName, lookup)
    if (hit) {
      matches.push({ water, mwa: hit.entry, method: hit.method })
    } else {
      unmatched.push(water.waterBodyName)
    }
  }

  console.log(`Matched ${matches.length}/${waters.length} waters to MWA listing`)
  if (unmatched.length) {
    console.log(`Unmatched (${unmatched.length}): ${unmatched.join(', ')}`)
  }

  const cache = loadCache()
  const idsToFetch = matches.map((m) => m.mwa.id)
  console.log(`Fetching coordinates for ${idsToFetch.length} detail pages...`)
  const coordsById = await fetchCoordsForIds(idsToFetch, cache)
  saveCache(cache)

  let updated = 0
  let unchanged = 0
  let missingCoords = 0
  const changes = []

  for (const { water, mwa, method } of matches) {
    const coords = coordsById.get(mwa.id)
    if (!coords) {
      missingCoords++
      continue
    }

    const prevLat = water.location.latitude
    const prevLng = water.location.longitude
    const moved =
      Math.abs(prevLat - coords.latitude) > 0.0001 ||
      Math.abs(prevLng - coords.longitude) > 0.0001

    if (moved) {
      water.location.latitude = coords.latitude
      water.location.longitude = coords.longitude
      water.location.cityRange = computeCityRange(coords.latitude, coords.longitude)
      updated++
      changes.push({
        name: water.waterBodyName,
        mwaName: mwa.name,
        method,
        from: [prevLat, prevLng],
        to: [coords.latitude, coords.longitude],
      })
    } else {
      unchanged++
    }
  }

  console.log(`\nCoordinate updates: ${updated} changed, ${unchanged} unchanged, ${missingCoords} missing from MWA`)
  if (changes.length) {
    console.log('\nSample changes (up to 15):')
    for (const c of changes.slice(0, 15)) {
      console.log(
        `  ${c.name} [${c.method}] -> ${c.mwaName}: (${c.from[0]}, ${c.from[1]}) => (${c.to[0]}, ${c.to[1]})`,
      )
    }
    if (changes.length > 15) console.log(`  ... and ${changes.length - 15} more`)
  }

  if (shouldWrite) {
    fs.writeFileSync(DATA_PATH, `${JSON.stringify(waters, null, 2)}\n`)
    console.log(`\nWrote ${DATA_PATH}`)
  } else {
    console.log('\nDry run — pass --write to update fish-waters.json')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
