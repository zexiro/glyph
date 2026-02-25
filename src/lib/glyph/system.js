// Writing system entry point — orchestrate generation from seed
import { createRng, seedFromString } from '../../utils/rng.js'
import { generateStrokeVocabulary } from './strokes.js'
import { generateRadicals } from './radicals.js'
import { composeGlyphs } from './composer.js'
import { validateDistinctness } from './similarity.js'

/**
 * Derive generation parameters from RNG.
 * These control the visual "feel" of the entire writing system.
 */
function deriveParams(rng) {
  return {
    curvature: rng.float(0.2, 0.8),
    gridType: rng.pick(['square', 'triangular', 'radial']),
    strokeWidth: rng.float(2, 4),
    taper: rng.float(0.3, 0.7),
  }
}

/**
 * Generate a complete writing system from a seed string.
 * Produces strokes, radicals, and glyphs that form a cohesive visual family.
 *
 * If initial generation produces glyphs that are too visually similar,
 * regeneration is attempted with offset seeds (up to 5 attempts).
 *
 * @param {string} seed - Seed string for deterministic generation
 * @returns {{ seed, numericSeed, params, strokes, radicals, glyphs }}
 */
export function generateWritingSystem(seed) {
  const numericSeed = seedFromString(seed)
  const maxAttempts = 5

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const rng = createRng(numericSeed + attempt * 9973)
    const params = deriveParams(rng)
    const strokes = generateStrokeVocabulary(rng, params)
    const radicals = generateRadicals(rng, strokes, params)
    const glyphs = composeGlyphs(rng, radicals, strokes, params)

    // Validate visual distinctness
    const validation = validateDistinctness(glyphs, strokes, 0.15)

    if (validation.valid || attempt === maxAttempts - 1) {
      return {
        seed,
        numericSeed,
        params,
        strokes,
        radicals,
        glyphs,
      }
    }
    // If not valid, retry with offset seed
  }

  // Unreachable due to attempt === maxAttempts - 1 check, but satisfies linter
  throw new Error('Writing system generation failed')
}
