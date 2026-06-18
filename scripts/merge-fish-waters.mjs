#!/usr/bin/env node
/**
 * Merge freshly extracted TroutData.json into datas/fish-waters.json.
 * Preserves waterBodyType and enriched location data for existing entries.
 *
 * Usage:
 *   node scripts/merge-fish-waters.mjs <extracted.json>
 *   node scripts/merge-fish-waters.mjs <extracted.json> --write
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_PATH = path.join(__dirname, '../datas/fish-waters.json')
const BACKUP_PATH = path.join(__dirname, '../datas/fish-waters.backup.json')

const extractedPath = process.argv[2]
const shouldWrite = process.argv.includes('--write')

if (!extractedPath) {
  console.error('Usage: node scripts/merge-fish-waters.mjs <extracted.json> [--write]')
  process.exit(1)
}

const resolvedExtractedPath = path.resolve(extractedPath)
const extracted = JSON.parse(fs.readFileSync(resolvedExtractedPath, 'utf8'))
const existing = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'))

const existingById = new Map(existing.map((water) => [water.id, water]))

function normalizeAts(ats) {
  return ats.replace(/\s+/g, '').toUpperCase()
}

const existingByAts = new Map(
  existing.map((water) => [normalizeAts(water.location.name), water]),
)

function hasEnrichedLocation(location) {
  return (
    location.latitude !== 0 &&
    location.longitude !== 0 &&
    location.cityRange.calgaryKMRange !== 0 &&
    location.cityRange.edmontonKMRange !== 0
  )
}

function findPreviousEntry(incoming) {
  const byId = existingById.get(incoming.id)
  if (byId) return byId

  const byAts = existingByAts.get(normalizeAts(incoming.location.name))
  if (byAts) return byAts

  return undefined
}

function mergeEntry(incoming, previous) {
  if (!previous) {
    return incoming
  }

  const merged = { ...incoming, id: previous.id }

  merged.waterBodyType = previous.waterBodyType

  if (hasEnrichedLocation(previous.location)) {
    merged.location = {
      ...incoming.location,
      latitude: previous.location.latitude,
      longitude: previous.location.longitude,
      cityRange: { ...previous.location.cityRange },
    }
  }

  return merged
}

const merged = extracted.map((incoming) =>
  mergeEntry(incoming, findPreviousEntry(incoming)),
)
const mergedIds = new Set(merged.map((water) => water.id))

const added = merged.filter((water) => !existingById.has(water.id))
const updated = merged.filter((water) => existingById.has(water.id))
const removed = existing.filter((water) => !mergedIds.has(water.id))

console.log('=== Fish Waters Merge ===\n')
console.log(`Extracted entries: ${extracted.length}`)
console.log(`Existing entries:  ${existing.length}`)
console.log(`Merged entries:    ${merged.length}`)
console.log(`New waters:        ${added.length}`)
console.log(`Updated waters:    ${updated.length}`)
console.log(`Removed from PDF:  ${removed.length}`)

if (added.length > 0) {
  console.log('\nNew waters:')
  for (const water of added) {
    console.log(`  + ${water.waterBodyName} (${water.id})`)
  }
}

if (removed.length > 0) {
  console.log('\nNo longer in PDF (kept out of merged output):')
  for (const water of removed.slice(0, 20)) {
    console.log(`  - ${water.waterBodyName} (${water.id})`)
  }
  if (removed.length > 20) {
    console.log(`  ... and ${removed.length - 20} more`)
  }
}

merged.sort((a, b) => a.waterBodyName.localeCompare(b.waterBodyName))

if (shouldWrite) {
  if (!fs.existsSync(BACKUP_PATH)) {
    fs.copyFileSync(DATA_PATH, BACKUP_PATH)
    console.log(`\nBackup saved to ${BACKUP_PATH}`)
  }

  fs.writeFileSync(DATA_PATH, `${JSON.stringify(merged, null, 2)}\n`)
  console.log(`Updated ${DATA_PATH}`)
} else {
  console.log('\nDry run. Re-run with --write to save.')
}
