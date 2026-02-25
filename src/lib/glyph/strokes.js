// Stroke primitive generation — cubic Bezier strokes with calligraphic character
import { clamp, lerp, TAU } from '../../utils/math.js'

// Grid anchor generators — produce anchor points that strokes connect between
const gridGenerators = {
  square(rng, count) {
    const points = []
    for (let i = 0; i < count; i++) {
      // Snap loosely to a 5x5 grid with jitter
      const gx = rng.int(0, 4) / 4
      const gy = rng.int(0, 4) / 4
      points.push({
        x: clamp(gx + rng.float(-0.08, 0.08), 0.05, 0.95),
        y: clamp(gy + rng.float(-0.08, 0.08), 0.05, 0.95),
      })
    }
    return points
  },

  triangular(rng, count) {
    const points = []
    for (let i = 0; i < count; i++) {
      const row = rng.int(0, 4)
      const col = rng.int(0, 4)
      const xOff = row % 2 === 1 ? 0.125 : 0
      points.push({
        x: clamp(col / 4 + xOff + rng.float(-0.06, 0.06), 0.05, 0.95),
        y: clamp(row / 4 + rng.float(-0.06, 0.06), 0.05, 0.95),
      })
    }
    return points
  },

  radial(rng, count) {
    const points = []
    for (let i = 0; i < count; i++) {
      const angle = rng.float(0, TAU)
      const radius = rng.float(0.1, 0.4)
      points.push({
        x: 0.5 + Math.cos(angle) * radius,
        y: 0.5 + Math.sin(angle) * radius,
      })
    }
    return points
  },
}

// Generate a single Bezier segment between two points with curvature bias
function makeSegment(rng, from, to, curvature) {
  const mx = (from.x + to.x) / 2
  const my = (from.y + to.y) / 2
  const dx = to.x - from.x
  const dy = to.y - from.y

  // Perpendicular offset scaled by curvature
  const perpX = -dy
  const perpY = dx
  const bias1 = rng.float(-curvature, curvature)
  const bias2 = rng.float(-curvature, curvature)

  return {
    p0: { x: from.x, y: from.y },
    p1: {
      x: lerp(from.x, mx, 0.5) + perpX * bias1,
      y: lerp(from.y, my, 0.5) + perpY * bias1,
    },
    p2: {
      x: lerp(to.x, mx, 0.5) + perpX * bias2,
      y: lerp(to.y, my, 0.5) + perpY * bias2,
    },
    p3: { x: to.x, y: to.y },
  }
}

// Stroke archetypes for variety
const archetypes = [
  // Simple curve — single segment between two points
  function simpleCurve(rng, anchors, curvature) {
    const a = rng.pick(anchors)
    const b = rng.pick(anchors)
    // Ensure minimum length
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len = Math.sqrt(dx * dx + dy * dy)
    const target = len < 0.15
      ? { x: a.x + (dx / (len || 1)) * 0.2, y: a.y + (dy / (len || 1)) * 0.2 }
      : b
    return [makeSegment(rng, a, target, curvature)]
  },

  // Long stroke — two segments chained
  function longStroke(rng, anchors, curvature) {
    const a = rng.pick(anchors)
    const mid = {
      x: clamp(a.x + rng.float(-0.3, 0.3), 0.05, 0.95),
      y: clamp(a.y + rng.float(-0.3, 0.3), 0.05, 0.95),
    }
    const b = {
      x: clamp(mid.x + rng.float(-0.3, 0.3), 0.05, 0.95),
      y: clamp(mid.y + rng.float(-0.3, 0.3), 0.05, 0.95),
    }
    return [
      makeSegment(rng, a, mid, curvature),
      makeSegment(rng, mid, b, curvature),
    ]
  },

  // Hook — short stroke with a tight curve at one end
  function hook(rng, anchors, curvature) {
    const a = rng.pick(anchors)
    const dir = rng.float(0, TAU)
    const hookLen = rng.float(0.08, 0.15)
    const mid = {
      x: clamp(a.x + Math.cos(dir) * 0.15, 0.05, 0.95),
      y: clamp(a.y + Math.sin(dir) * 0.15, 0.05, 0.95),
    }
    const tip = {
      x: clamp(mid.x + Math.cos(dir + rng.float(1.2, 2.0)) * hookLen, 0.05, 0.95),
      y: clamp(mid.y + Math.sin(dir + rng.float(1.2, 2.0)) * hookLen, 0.05, 0.95),
    }
    return [
      makeSegment(rng, a, mid, curvature * 0.5),
      makeSegment(rng, mid, tip, curvature * 1.5),
    ]
  },

  // Loop — three segments forming a partial loop
  function loop(rng, anchors, curvature) {
    const center = rng.pick(anchors)
    const radius = rng.float(0.08, 0.18)
    const startAngle = rng.float(0, TAU)
    const sweep = rng.float(TAU * 0.5, TAU * 0.85)
    const steps = 3
    const segments = []
    for (let i = 0; i < steps; i++) {
      const a0 = startAngle + (sweep * i) / steps
      const a1 = startAngle + (sweep * (i + 1)) / steps
      const from = {
        x: clamp(center.x + Math.cos(a0) * radius, 0.05, 0.95),
        y: clamp(center.y + Math.sin(a0) * radius, 0.05, 0.95),
      }
      const to = {
        x: clamp(center.x + Math.cos(a1) * radius, 0.05, 0.95),
        y: clamp(center.y + Math.sin(a1) * radius, 0.05, 0.95),
      }
      segments.push(makeSegment(rng, from, to, curvature * 1.2))
    }
    return segments
  },

  // Dot/short stroke — very short, mostly used as an accent
  function dot(rng, anchors, curvature) {
    const a = rng.pick(anchors)
    const dir = rng.float(0, TAU)
    const len = rng.float(0.03, 0.07)
    const b = {
      x: clamp(a.x + Math.cos(dir) * len, 0.05, 0.95),
      y: clamp(a.y + Math.sin(dir) * len, 0.05, 0.95),
    }
    return [makeSegment(rng, a, b, curvature * 0.3)]
  },
]

/**
 * Generate a vocabulary of stroke primitives.
 * @param {object} rng - Seeded RNG instance
 * @param {object} params - { curvature, gridType, strokeWidth, taper }
 * @returns {object[]} Array of stroke objects
 */
export function generateStrokeVocabulary(rng, params) {
  const { curvature = 0.5, gridType = 'square', strokeWidth = 3, taper = 0.5 } = params
  const count = rng.int(6, 10)
  const gridGen = gridGenerators[gridType] || gridGenerators.square
  const anchors = gridGen(rng, 20)

  const strokes = []
  // Ensure archetype variety: cycle through archetypes first, then fill randomly
  const shuffled = rng.shuffle([0, 1, 2, 3, 4])
  for (let i = 0; i < count; i++) {
    const archetypeIdx = i < shuffled.length ? shuffled[i] : rng.int(0, archetypes.length - 1)
    const archetype = archetypes[archetypeIdx]
    const segments = archetype(rng, anchors, curvature)

    strokes.push({
      id: i,
      segments,
      baseWidth: strokeWidth + rng.float(-0.5, 0.5),
    })
  }

  return strokes
}
