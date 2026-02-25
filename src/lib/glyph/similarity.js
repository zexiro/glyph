// Visual distinctness validation — rasterize glyphs to low-res grids and compare
import { cubicBezier } from '../../utils/bezier.js'

const GRID_SIZE = 16 // 16x16 binary grid for comparison

/**
 * Rasterize a glyph's strokes onto a low-res binary grid.
 * @param {object} glyph - Glyph with positionedStrokes
 * @param {object[]} strokes - Stroke vocabulary
 * @returns {Uint8Array} Flattened GRID_SIZE*GRID_SIZE binary array
 */
function rasterizeGlyph(glyph, strokes) {
  const grid = new Uint8Array(GRID_SIZE * GRID_SIZE)

  for (const ps of glyph.positionedStrokes) {
    const stroke = strokes[ps.strokeIdx]
    if (!stroke) continue
    const { x: tx, y: ty, scale, rotation } = ps.transform
    const cos = Math.cos(rotation)
    const sin = Math.sin(rotation)

    for (const seg of stroke.segments) {
      // Sample ~20 points per segment for grid rasterization
      const steps = 20
      for (let i = 0; i <= steps; i++) {
        const t = i / steps
        const pt = cubicBezier(seg.p0, seg.p1, seg.p2, seg.p3, t)

        // Apply transform: scale, rotate, translate
        const sx = pt.x * scale
        const sy = pt.y * scale
        const rx = sx * cos - sy * sin + tx
        const ry = sx * sin + sy * cos + ty

        // Map to grid coordinates
        const gx = Math.floor(rx * GRID_SIZE)
        const gy = Math.floor(ry * GRID_SIZE)

        if (gx >= 0 && gx < GRID_SIZE && gy >= 0 && gy < GRID_SIZE) {
          grid[gy * GRID_SIZE + gx] = 1
          // Also mark neighbors for stroke width approximation
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nx = gx + dx
              const ny = gy + dy
              if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
                grid[ny * GRID_SIZE + nx] = 1
              }
            }
          }
        }
      }
    }
  }

  return grid
}

/**
 * Compute Hamming-like distance between two binary grids.
 * Returns normalized distance in [0, 1].
 */
function gridDistance(gridA, gridB) {
  const total = gridA.length
  let diff = 0
  let unionCount = 0

  for (let i = 0; i < total; i++) {
    if (gridA[i] !== gridB[i]) diff++
    if (gridA[i] || gridB[i]) unionCount++
  }

  // Use Jaccard-like distance: difference cells / union cells
  // Falls back to Hamming if union is small
  if (unionCount < 5) return 1 // Both nearly empty = treat as distinct
  return diff / unionCount
}

/**
 * Validate that all glyphs are visually distinct from each other.
 * @param {object[]} glyphs - Array of glyph objects
 * @param {object[]} strokes - Stroke vocabulary
 * @param {number} minDistance - Minimum distance threshold (0-1), default 0.2
 * @returns {{ valid: boolean, pairs: Array<{ a: number, b: number, distance: number }> }}
 */
export function validateDistinctness(glyphs, strokes, minDistance = 0.2) {
  // Rasterize all glyphs
  const grids = glyphs.map(g => rasterizeGlyph(g, strokes))

  // Compare all pairs
  const tooSimilar = []
  for (let i = 0; i < glyphs.length; i++) {
    for (let j = i + 1; j < glyphs.length; j++) {
      const distance = gridDistance(grids[i], grids[j])
      if (distance < minDistance) {
        tooSimilar.push({
          a: glyphs[i].id,
          b: glyphs[j].id,
          distance,
        })
      }
    }
  }

  return {
    valid: tooSimilar.length === 0,
    pairs: tooSimilar,
  }
}
