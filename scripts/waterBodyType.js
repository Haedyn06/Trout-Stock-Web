/**
 * Classifies Alberta stocked water bodies by type using naming conventions
 * from Alberta Environment & Parks / My Wild Alberta stocking reports.
 *
 * Types:
 * - lake: natural or named lakes (includes multi-lake complexes)
 * - river: rivers, creeks, and streams (not creek-side ponds)
 * - pond: urban/community ponds, mine pits, borrow pits, park ponds
 * - reservoir: dams and storage reservoirs
 */

/** @typedef {'lake' | 'river' | 'pond' | 'reservoir'} WaterBodyType */

/** @type {Record<string, WaterBodyType>} */
export const MANUAL_OVERRIDES = {
  by_the_lake_park: 'pond',
  chain_lakes_lower_chain: 'lake',
  claude_n_brennan: 'pond',
  high_level_community: 'pond',
  morinville_fish_and_game: 'pond',
  oyen_concrete_plant: 'pond',
  ponoka_centennial_park: 'pond',
  whiteridge_recreation_area: 'pond',
  wildhorse_lakes_lower: 'lake',
  east_pit_lake: 'pond',
  open_creek_reservoir: 'reservoir',
  severn_creek_reservoir: 'reservoir',
}

/**
 * @param {string} name
 * @param {string} [id]
 * @returns {WaterBodyType}
 */
export function classifyWaterBodyType(name, id = '') {
  if (id && MANUAL_OVERRIDES[id]) {
    return MANUAL_OVERRIDES[id]
  }

  const normalized = name.toLowerCase()

  if (
    /\b(pond|ponds|pit|pits|borrow pit|stormwater|concrete plant|recreation area|fish and game|children'?s pond|town pond|trout pond|park pond|sportplex|centennial park)\b/.test(
      normalized,
    ) ||
    /\bmine pit\b/.test(normalized)
  ) {
    return 'pond'
  }

  if (/\b(creek|river|stream)\b/.test(normalized)) {
    return 'river'
  }

  if (/\b(reservoir|aquaduct|aqueduct)\b/.test(normalized)) {
    return 'reservoir'
  }

  if (/\b(lake|lakes)\b/.test(normalized)) {
    return 'lake'
  }

  if (
    /\b(park|college|community|highway|shell|texaco|md peace)\b/.test(
      normalized,
    )
  ) {
    return 'pond'
  }

  return 'lake'
}

export const WATER_BODY_TYPES = ['lake', 'river', 'pond', 'reservoir']

/** @type {Record<WaterBodyType, string>} */
export const WATER_BODY_TYPE_LABELS = {
  lake: 'Lake',
  river: 'River',
  pond: 'Pond',
  reservoir: 'Reservoir',
}
