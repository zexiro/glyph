// Meaning pool and assignment — maps glyphs to colors, shapes, and labels

const COLORS = [
  { hex: '#5BCEA6', name: 'teal' },
  { hex: '#D4A857', name: 'amber' },
  { hex: '#E87461', name: 'rose' },
  { hex: '#9B7ED8', name: 'violet' },
  { hex: '#4ADE80', name: 'emerald' },
  { hex: '#F97066', name: 'coral' },
  { hex: '#818CF8', name: 'indigo' },
  { hex: '#FCD34D', name: 'gold' },
]

const SHAPES = ['circle', 'triangle', 'square', 'diamond', 'star', 'wave', 'spiral', 'cross']
const LABELS = ['flow', 'peak', 'root', 'echo', 'bloom', 'drift', 'void', 'spark']

/**
 * Assign meanings to glyphs. Glyphs sharing a radical share a color family.
 * @param {object} rng - Seeded RNG
 * @param {object[]} glyphs - Array of glyph objects with .id and .radicalIds
 * @param {object[]} radicals - Array of radical objects with .id and .category
 * @returns {Map<number, object>} Map of glyphId → { color, colorName, shape, label }
 */
export function assignMeanings(rng, glyphs, radicals) {
  const meanings = new Map()

  // Group glyphs by their first radical's category
  const categoryMap = new Map()
  for (const glyph of glyphs) {
    const firstRadicalIdx = glyph.radicalIndices[0]
    const radical = radicals[firstRadicalIdx]
    const category = radical ? radical.category : 'unknown'
    if (!categoryMap.has(category)) {
      categoryMap.set(category, [])
    }
    categoryMap.get(category).push(glyph)
  }

  // Assign one color per category
  const shuffledColors = rng.shuffle(COLORS)
  const categoryColors = new Map()
  let colorIdx = 0
  for (const category of categoryMap.keys()) {
    categoryColors.set(category, shuffledColors[colorIdx % shuffledColors.length])
    colorIdx++
  }

  // Build unique shape+label pairs — pair shapes and labels 1:1, then extend
  // with additional unique combos for glyphs beyond 8
  const shuffledShapes = rng.shuffle([...SHAPES])
  const shuffledLabels = rng.shuffle([...LABELS])
  const basePairs = shuffledShapes.map((shape, i) => ({ shape, label: shuffledLabels[i] }))

  // For glyphs beyond 8, create additional unique combos
  const extraPairs = []
  for (const shape of rng.shuffle([...SHAPES])) {
    for (const label of rng.shuffle([...LABELS])) {
      const key = `${shape}-${label}`
      if (!basePairs.some(p => p.shape === shape && p.label === label)) {
        extraPairs.push({ shape, label })
      }
    }
  }
  const allPairs = [...basePairs, ...rng.shuffle(extraPairs)]

  // Assign unique shape+label to each glyph, color from its category
  let pairIdx = 0
  for (const [category, categoryGlyphs] of categoryMap) {
    const color = categoryColors.get(category)
    for (const glyph of categoryGlyphs) {
      const pair = allPairs[pairIdx % allPairs.length]
      meanings.set(glyph.id, {
        color: color.hex,
        colorName: color.name,
        shape: pair.shape,
        label: pair.label,
      })
      pairIdx++
    }
  }

  return meanings
}

export { COLORS, SHAPES, LABELS }
