#!/usr/bin/env node
/**
 * Adds or updates waterBodyType on all entries in fish-waters.json
 *
 * Usage:
 *   node scripts/classify-water-body-types.mjs
 *   node scripts/classify-water-body-types.mjs --write
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  classifyWaterBodyType,
  WATER_BODY_TYPE_LABELS,
} from './waterBodyType.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_PATH = path.join(__dirname, '../datas/fish-waters.json')
const shouldWrite = process.argv.includes('--write')

const waters = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'))
const counts = { lake: 0, river: 0, pond: 0, reservoir: 0 }

for (const water of waters) {
  const type = classifyWaterBodyType(water.waterBodyName, water.id)
  water.waterBodyType = type
  counts[type]++
}

console.log('=== Water Body Type Classification ===\n')
for (const [type, count] of Object.entries(counts)) {
  console.log(`${WATER_BODY_TYPE_LABELS[type]}: ${count}`)
}

console.log('\nSample classifications:')
for (const water of waters.slice(0, 8)) {
  console.log(
    `  ${WATER_BODY_TYPE_LABELS[water.waterBodyType]} — ${water.waterBodyName}`,
  )
}

if (shouldWrite) {
  fs.writeFileSync(DATA_PATH, `${JSON.stringify(waters, null, 2)}\n`)
  console.log(`\nUpdated ${DATA_PATH}`)
} else {
  console.log('\nDry run. Re-run with --write to save.')
}
