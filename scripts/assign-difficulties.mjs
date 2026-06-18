#!/usr/bin/env node
/**
 * Reassign difficulty (1–5) for all waters using My Wild Alberta access metadata.
 *
 * Scale: 1 Easy, 2 Fair, 3 Moderate, 4 Hard, 5 Difficult
 * Source: https://mywildalberta.ca/fishing/fish-stocking/stocking-maps.aspx
 *
 * Usage:
 *   node scripts/assign-difficulties.mjs              # dry run + report
 *   node scripts/assign-difficulties.mjs --write      # update fish-waters.json
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_PATH = path.join(__dirname, '../datas/fish-waters.json')
const META_PATH = path.join(__dirname, '../datas/site-meta.json')
const ASSIGNMENTS_PATH = path.join(__dirname, '../datas/difficulty-assignments.json')
const CACHE_PATH = path.join(__dirname, '.mwa-difficulty-cache.json')

const LISTING_URL =
  'https://mywildalberta.ca/fishing/fish-stocking/stocking-maps.aspx/data/stocking-maps.aspx?listing=1'
const DETAIL_URL = (id) =>
  `https://mywildalberta.ca/fishing/fish-stocking/stocking-maps.aspx?id=${id}`
const MWA_SOURCE =
  'https://mywildalberta.ca/fishing/fish-stocking/stocking-maps.aspx'

const shouldWrite = process.argv.includes('--write')
const CONCURRENCY = 8
const FETCH_DELAY_MS = 120

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
  'Twin Lakes (East Twin Lake)': 'East Twin Lake',
  'Montaganeusse Lake (Stoney)': 'Montagneuse Lake (Stony Lake)',
  'Captain Eyre Lake (Capt Ayre)': 'Captain Ayre Lake',
  'Claude N. Brennan Memorial': 'Claude N Bernnan Memorial Pond (Vermillion Park',
}

/** id -> difficulty when MWA/heuristics need a human override */
const MANUAL_DIFFICULTY = {
  bullshead_reservoir: 3,
  lamont_pond: 1,
  little_beaverdam_lake: 3,
  spring_lake: 3,
  tim_horton_children_s_pond: 1,
  valleyview_children_s_pond: 1,
  dolberg_lake: 3,
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
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
  }

  const lowerUpper = n.match(/^(lower|upper)\s+(.+)$/)
  if (lowerUpper) {
    variants.add(normalize(`${lowerUpper[2]} (${lowerUpper[1]})`))
  }

  const parenLU = n.match(/^(.+?)\s*\((lower|upper)([^)]*)\)\s*$/)
  if (parenLU) {
    variants.add(normalize(`${parenLU[2]} ${parenLU[1]}`))
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
  return { byExact, byVariant }
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

function parseMwaAccessInfo(html) {
  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')

  let amenities = ''
  let description = ''

  const amenitiesMatch = stripped.match(
    /Site Amenities:\s*<\/li>\s*([\s\S]*?)(?:<p[^>]*>\s*<strong>Site Description|<strong>Site Description)/i,
  )
  if (amenitiesMatch) {
    amenities = amenitiesMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  }

  const descMatch = stripped.match(
    /Site Description:\s*<\/p>\s*([\s\S]*?)(?:Return to map|class=['"]btn)/i,
  )
  if (descMatch) {
    description = descMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  }

  if (!description) {
    const alt = stripped.match(/<strong>Site Description:<\/strong>\s*([\s\S]*?)(?:Return to map)/i)
    if (alt) description = alt[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  }

  const combined = `${amenities} ${description}`.toLowerCase()
  return { amenities, description, combined }
}

function minCityDistance(water) {
  const { calgaryKMRange, edmontonKMRange } = water.location.cityRange
  const values = [calgaryKMRange, edmontonKMRange].filter((km) => km > 0)
  return values.length ? Math.min(...values) : 999
}

function scoreFromMwaText({ combined, waterBodyType, waterBodyName }) {
  const name = waterBodyName.toLowerCase()
  let score = waterBodyType === 'pond' ? 2 : waterBodyType === 'reservoir' ? 2 : 3

  if (/helicopter stocked|helicopter stock|fly[\s-]?in only|float plane/.test(combined)) {
    return { difficulty: 5, reasons: ['helicopter/fly-in access'] }
  }

  if (
    /only accessible by hiking|hike or bike|hiking or biking only|hike-in|hike in only|foot access only|biking only|bike access only|non-motorized trail/.test(
      combined,
    )
  ) {
    score = 4
  } else if (/hik(e|ing)|\d+[\s-]*(km|kilometre|kilometer)|trail loop|backcountry/.test(combined)) {
    score = Math.max(score, 4)
  }

  if (/no amenities|has no amenities/.test(combined)) score += 1
  if (/remote|isolated|rough road|unmaintained|primitive|wilderness|backcountry/.test(combined)) {
    score += 1
  }
  if (
    /gravel road|gravel parking|crude boat launch|hand launch|limited facilities|smaller boats/.test(
      combined,
    )
  ) {
    score = Math.max(score, 3)
  }
  if (/young families|might be just right for young families/.test(combined)) {
    score = Math.min(score, 2)
  }

  if (
    /children'?s|kids can catch|family fishing|family pond|youth pond|learn to fish/.test(
      combined + ' ' + name,
    )
  ) {
    score = 1
  }
  if (/town pond|community pond|urban pond|municipal|city pond/.test(combined + ' ' + name)) {
    score = Math.min(score, 1)
  }
  if (/fish and game pond|park pond|day-use area|designated day-use|boat launch|parking area|toilet|accessible for families/.test(combined)) {
    score -= 1
  }
  if (/easy shoreline|road accessible|road access|highway|paved/.test(combined)) {
    score -= 1
  }

  const reasons = []
  if (/helicopter/.test(combined)) reasons.push('helicopter stocked')
  if (/hik|bike|trail/.test(combined)) reasons.push('trail/hike access')
  if (/no amenities/.test(combined)) reasons.push('no amenities')
  if (/children|family|town|community|day-use|boat launch/.test(combined)) {
    reasons.push('developed/day-use access')
  }
  if (!reasons.length) reasons.push('MWA site description')

  return { difficulty: clamp(Math.round(score), 1, 5), reasons }
}

function fallbackDifficulty(water) {
  const name = water.waterBodyName.toLowerCase()
  let score =
    { pond: 1, reservoir: 2, lake: 3, river: 2 }[water.waterBodyType] ?? 3
  const reasons = [`fallback:${water.waterBodyType}`]

  if (
    /children|kids can catch|town pond|community|centennial|sportplex|stormwater|wetaskiwin pond|whitecourt town/.test(
      name,
    )
  ) {
    score = 1
    reasons.push('urban/community pond name')
  } else if (/fish and game|trout pond|park pond|recreation pond/.test(name)) {
    score = Math.min(score, 2)
    reasons.push('local stocked pond name')
  } else if (/pit \d|mine pit|borrow pit|aquaduct/.test(name)) {
    score = 3
    reasons.push('industrial pit/borrow site')
  } else if (
    /wildhorse|fortress|rawson|galatea|sarrail|pocaterra|three isle|chephren|spray lakes/.test(
      name,
    )
  ) {
    score = Math.max(score, 4)
    reasons.push('mountain/backcountry lake name')
  }

  const minKm = minCityDistance(water)
  if (minKm > 350 && score < 4) {
    score += 1
    reasons.push(`remote:>${minKm}km from Calgary/Edmonton`)
  }

  return { difficulty: clamp(score, 1, 5), reasons }
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
    headers: { 'User-Agent': 'StockFishStat/1.0 (difficulty assignment)' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.text()
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchMwaPages(ids, cache) {
  const results = new Map()
  const queue = [...new Set(ids)]

  async function worker() {
    while (queue.length > 0) {
      const id = queue.shift()
      if (results.has(id)) continue

      if (cache[id]?.combined) {
        results.set(id, cache[id])
        continue
      }

      await sleep(FETCH_DELAY_MS)
      try {
        const html = await fetchText(DETAIL_URL(id))
        const info = parseMwaAccessInfo(html)
        cache[id] = { ...info, fetchedAt: new Date().toISOString() }
        results.set(id, cache[id])
      } catch (err) {
        console.warn(`  Failed MWA id=${id}: ${err.message}`)
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
  const lookup = buildLookup(parseListing(listingHtml))
  const waters = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'))

  const matches = []
  const unmatched = []
  for (const water of waters) {
    const hit = findMwaMatch(water.waterBodyName, lookup)
    if (hit) matches.push({ water, mwa: hit.entry })
    else unmatched.push(water)
  }

  console.log(`Matched ${matches.length}/${waters.length} to MWA for access info`)

  const cache = loadCache()
  const mwaPages = await fetchMwaPages(
    matches.map((m) => m.mwa.id),
    cache,
  )
  saveCache(cache)

  const assignments = []
  let changed = 0

  for (const water of waters) {
    let result

    if (MANUAL_DIFFICULTY[water.id] !== undefined) {
      result = {
        difficulty: MANUAL_DIFFICULTY[water.id],
        source: 'manual',
        reasons: ['manual override (not on MWA or known local access)'],
        mwaId: null,
        mwaUrl: null,
      }
    } else {
      const match = findMwaMatch(water.waterBodyName, lookup)
      if (match) {
        const page = mwaPages.get(match.entry.id)
        if (page?.combined) {
          const scored = scoreFromMwaText({
            combined: page.combined,
            waterBodyType: water.waterBodyType,
            waterBodyName: water.waterBodyName,
          })
          result = {
            difficulty: scored.difficulty,
            source: 'mywildalberta',
            reasons: scored.reasons,
            mwaId: match.entry.id,
            mwaUrl: `${DETAIL_URL(match.entry.id)}`,
            excerpt: page.combined.slice(0, 240),
          }
        } else {
          const scored = fallbackDifficulty(water)
          result = {
            difficulty: scored.difficulty,
            source: 'fallback',
            reasons: scored.reasons,
            mwaId: match.entry.id,
            mwaUrl: `${DETAIL_URL(match.entry.id)}`,
          }
        }
      } else {
        const scored = fallbackDifficulty(water)
        result = {
          difficulty: scored.difficulty,
          source: 'fallback',
          reasons: scored.reasons,
          mwaId: null,
          mwaUrl: null,
        }
      }
    }

    const prev = water.difficulty
    if (prev !== result.difficulty) changed++

    assignments.push({
      id: water.id,
      waterBodyName: water.waterBodyName,
      previousDifficulty: prev,
      difficulty: result.difficulty,
      source: result.source,
      reasons: result.reasons,
      mwaId: result.mwaId,
      mwaUrl: result.mwaUrl,
      excerpt: result.excerpt ?? null,
    })

    water.difficulty = result.difficulty
  }

  const dist = {}
  for (const a of assignments) dist[a.difficulty] = (dist[a.difficulty] || 0) + 1

  console.log(`\nNew distribution: ${JSON.stringify(dist)}`)
  console.log(`Changed ${changed}/${waters.length} difficulty ratings`)

  const samples = assignments
    .filter((a) => a.previousDifficulty !== a.difficulty)
    .slice(0, 12)
  if (samples.length) {
    console.log('\nSample changes:')
    for (const s of samples) {
      console.log(
        `  ${s.waterBodyName}: ${s.previousDifficulty} → ${s.difficulty} (${s.source}: ${s.reasons.join(', ')})`,
      )
    }
  }

  const meta = JSON.parse(fs.readFileSync(META_PATH, 'utf8'))
  meta.difficulty = {
    scale: {
      1: 'Easy — urban/community ponds, full facilities, roadside access',
      2: 'Fair — road-accessible lakes with basic amenities',
      3: 'Moderate — gravel roads, remote drives, mine pits, limited facilities',
      4: 'Hard — hike or bike access, backcountry trails',
      5: 'Difficult — helicopter/fly-in, very remote wilderness',
    },
    source: MWA_SOURCE,
    methodology:
      'Ratings derived from My Wild Alberta stocking map site amenities and descriptions (access, remoteness, facilities), with name/type heuristics and manual overrides where MWA has no listing.',
    lastAssigned: '2026-06-15',
    assignmentsFile: 'difficulty-assignments.json',
  }

  if (shouldWrite) {
    fs.writeFileSync(DATA_PATH, `${JSON.stringify(waters, null, 2)}\n`)
    fs.writeFileSync(META_PATH, `${JSON.stringify(meta, null, 2)}\n`)
    fs.writeFileSync(
      ASSIGNMENTS_PATH,
      `${JSON.stringify({ generatedAt: new Date().toISOString(), assignments }, null, 2)}\n`,
    )
    console.log(`\nWrote ${DATA_PATH}`)
    console.log(`Wrote ${META_PATH}`)
    console.log(`Wrote ${ASSIGNMENTS_PATH}`)
  } else {
    console.log('\nDry run — pass --write to apply')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
