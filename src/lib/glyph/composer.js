// Glyph composition — assemble radicals into complete glyphs
import { clamp, TAU } from '../../utils/math.js'

// Slot layout regions in normalized 0-1 space
const SLOT_REGIONS = {
  top:    { x: 0.2, y: 0.05, scale: 0.5 },
  bottom: { x: 0.2, y: 0.55, scale: 0.5 },
  left:   { x: 0.0, y: 0.15, scale: 0.45 },
  right:  { x: 0.5, y: 0.15, scale: 0.45 },
  center: { x: 0.15, y: 0.15, scale: 0.7 },
}

// When a single radical is used, center it
const SINGLE_SLOT = { x: 0.1, y: 0.1, scale: 0.8 }

/**
 * Position strokes from a radical within its slot region.
 * Returns an array of positioned stroke descriptors.
 */
function positionRadical(radical, strokes, region, rng) {
  const positioned = []
  const rotation = rng.float(-0.1, 0.1) // Slight rotation for organic feel

  for (const strokeIdx of radical.strokeIndices) {
    positioned.push({
      strokeIdx,
      transform: {
        x: region.x + rng.float(-0.02, 0.02),
        y: region.y + rng.float(-0.02, 0.02),
        scale: region.scale + rng.float(-0.05, 0.05),
        rotation,
      },
    })
  }

  return positioned
}

/**
 * Generate an optional connecting stroke between radicals.
 */
function makeConnector(rng, strokes, regionA, regionB) {
  // Pick a simple stroke to use as connector
  const strokeIdx = rng.int(0, strokes.length - 1)
  const midX = (regionA.x + regionB.x) / 2 + rng.float(-0.05, 0.05)
  const midY = (regionA.y + regionB.y) / 2 + rng.float(-0.05, 0.05)

  return {
    strokeIdx,
    transform: {
      x: midX,
      y: midY,
      scale: 0.3 + rng.float(-0.05, 0.05),
      rotation: rng.float(-0.3, 0.3),
    },
  }
}

/**
 * Compose glyphs from radicals and strokes.
 * @param {object} rng - Seeded RNG instance
 * @param {object[]} radicals - Radical definitions
 * @param {object[]} strokes - Stroke vocabulary
 * @param {object} params - Generation parameters
 * @returns {object[]} Array of glyph objects
 */
export function composeGlyphs(rng, radicals, strokes, params) {
  const count = rng.int(12, 16)
  const glyphs = []

  // Build diverse glyph configurations
  const configs = []
  // Single-radical glyphs
  for (let i = 0; i < radicals.length && configs.length < count; i++) {
    configs.push([i])
  }
  // Two-radical glyphs
  for (let i = 0; i < radicals.length && configs.length < count; i++) {
    for (let j = i + 1; j < radicals.length && configs.length < count; j++) {
      configs.push([i, j])
    }
  }
  // Three-radical glyphs for remaining
  for (let i = 0; i < radicals.length && configs.length < count; i++) {
    for (let j = i + 1; j < radicals.length && configs.length < count; j++) {
      for (let k = j + 1; k < radicals.length && configs.length < count; k++) {
        configs.push([i, j, k])
      }
    }
  }

  // Shuffle and take what we need
  const shuffled = rng.shuffle(configs).slice(0, count)

  for (let g = 0; g < shuffled.length; g++) {
    const radicalIndices = shuffled[g]
    const positionedStrokes = []

    if (radicalIndices.length === 1) {
      // Single radical — centered
      const radical = radicals[radicalIndices[0]]
      positionedStrokes.push(...positionRadical(radical, strokes, SINGLE_SLOT, rng))
    } else {
      // Multiple radicals — use their slot assignments
      const usedRegions = []
      for (const ri of radicalIndices) {
        const radical = radicals[ri]
        const region = SLOT_REGIONS[radical.slot]
        positionedStrokes.push(...positionRadical(radical, strokes, region, rng))
        usedRegions.push(region)
      }

      // Add connecting strokes between adjacent radicals (50% chance)
      for (let i = 0; i < usedRegions.length - 1; i++) {
        if (rng.bool(0.5)) {
          positionedStrokes.push(
            makeConnector(rng, strokes, usedRegions[i], usedRegions[i + 1])
          )
        }
      }
    }

    // Compute bounding box of all transforms
    let minX = 1, minY = 1, maxX = 0, maxY = 0
    for (const ps of positionedStrokes) {
      const t = ps.transform
      minX = Math.min(minX, t.x)
      minY = Math.min(minY, t.y)
      maxX = Math.max(maxX, t.x + t.scale)
      maxY = Math.max(maxY, t.y + t.scale)
    }

    glyphs.push({
      id: g,
      radicalIndices,
      positionedStrokes,
      bounds: {
        x: minX,
        y: minY,
        w: clamp(maxX - minX, 0.1, 1),
        h: clamp(maxY - minY, 0.1, 1),
      },
    })
  }

  return glyphs
}
