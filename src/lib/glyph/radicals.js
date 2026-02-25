// Radical construction — combine strokes into reusable sub-glyph units

const SLOTS = ['top', 'bottom', 'left', 'right', 'center']

/**
 * Generate radicals from a stroke vocabulary.
 * Each radical selects 1-3 strokes and assigns a layout slot and semantic category.
 * @param {object} rng - Seeded RNG instance
 * @param {object[]} strokes - Stroke vocabulary from generateStrokeVocabulary
 * @param {object} params - Generation parameters
 * @returns {object[]} Array of radical objects
 */
export function generateRadicals(rng, strokes, params) {
  const count = rng.int(4, 8)
  const radicals = []
  const usedSlotCombos = new Set()
  const categoryCount = Math.max(2, Math.ceil(count / 2))

  for (let i = 0; i < count; i++) {
    // Pick 1-3 strokes, weighted toward 2
    const strokeCount = rng.float() < 0.2 ? 1 : rng.float() < 0.7 ? 2 : 3
    const indices = []
    const available = [...Array(strokes.length).keys()]

    for (let s = 0; s < strokeCount && available.length > 0; s++) {
      const pickIdx = rng.int(0, available.length - 1)
      indices.push(available[pickIdx])
      available.splice(pickIdx, 1)
    }

    // Assign slot — try for variety
    let slot
    const shuffledSlots = rng.shuffle(SLOTS)
    for (const candidate of shuffledSlots) {
      const key = `${candidate}-${indices.length}`
      if (!usedSlotCombos.has(key)) {
        slot = candidate
        usedSlotCombos.add(key)
        break
      }
    }
    if (!slot) slot = rng.pick(SLOTS)

    radicals.push({
      id: i,
      strokeIndices: indices,
      slot,
      category: i % categoryCount,
    })
  }

  return radicals
}
