#!/usr/bin/env node
/**
 * Difficulty estimates for waters added from the 2026 stocking PDF.
 * Scale: 1 Easy, 2 Fair, 3 Moderate, 4 Hard, 5 Difficult
 *
 * Based on My Wild Alberta stocking maps (access, amenities, remoteness).
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_PATH = path.join(__dirname, '../datas/fish-waters.json')

/** id -> difficulty */
const NEW_WATER_DIFFICULTIES = {
  // Easy town/family ponds
  hinton_f_and_g_pond_hinton: 1,

  // Fair — road accessible with day-use amenities or easy stocked fishing
  chatwin_lake: 2,
  cummings_lake: 2,
  grande_cache_lake: 2,
  highway_40_pond: 2,
  kakut_lake: 2,
  lloydminster_pond: 2,
  moonshine_lake_mirage: 2,
  nardam_lake: 2,
  niton_lake: 2,
  running_lake: 2,
  figure_eight_lake: 2,
  ole_lake: 2,
  wildwood_pond: 2,

  // Moderate — remote drives, foot-access mine pits, trail access, or limited facilities
  dandurand_lake: 3,
  dunn_lake: 3,
  engstrom_lake: 3,
  jarvis_creek_pond: 3,
  mile_07_lake: 3,
  montaganeusse_lake: 3,
  muskiki_lake: 3,
  pit_24: 3,
  pit_35: 3,
  pit_44: 3,
  pit_45: 3,
  silkstone_lake: 3,
  sulphur_lake: 3,
  wildhorse_lakes_upper: 3,
  wolf_creek_pond: 3,

  // Hard — hike/bike access only
  lovett_lake: 4,
}

const waters = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'))
let updated = 0

for (const water of waters) {
  const difficulty = NEW_WATER_DIFFICULTIES[water.id]
  if (difficulty !== undefined) {
    water.difficulty = difficulty
    updated++
  }
}

fs.writeFileSync(DATA_PATH, `${JSON.stringify(waters, null, 2)}\n`)

console.log(`Updated difficulty for ${updated} newly added waters.`)
