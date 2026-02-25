// Calligraphic glyph renderer — filled polygon strokes with taper and noise
import { cubicBezier, cubicBezierNormal, buildArcLengthTable, arcLength, arcLengthToT } from '../../utils/bezier.js'
import { createNoise } from '../../utils/noise.js'
import { smoothstep, clamp, lerp } from '../../utils/math.js'

const DEFAULT_COLOR = '#F5E6C8'
const SAMPLES_PER_SEGMENT = 16 // samples per Bezier segment

/**
 * Taper profile: width tapers to ~30% at start/end of stroke.
 * @param {number} t - Position along stroke (0-1)
 * @param {number} taper - Taper amount (0-1)
 */
function taperProfile(t, taper) {
  // Smooth taper at both ends
  const startTaper = smoothstep(0, taper, t)
  const endTaper = smoothstep(0, taper, 1 - t)
  return lerp(0.3, 1.0, startTaper * endTaper)
}

/**
 * Velocity profile: thinner in mid-stroke (simulating pen speed), thicker at endpoints.
 * @param {number} t - Position along stroke (0-1)
 */
function velocityProfile(t) {
  // Dip in the middle: thinnest at t=0.5
  const midDip = 1 - 0.25 * Math.sin(t * Math.PI)
  return midDip
}

/**
 * Render a single positioned stroke as a filled calligraphic polygon.
 */
function renderStroke(ctx, stroke, transform, params, options, noise, noiseOffset) {
  const { taper = 0.5 } = params
  const { scale: canvasScale = 1, offsetX = 0, offsetY = 0, noiseAmount = 0.3 } = options
  const { x: tx, y: ty, scale: strokeScale, rotation } = transform

  const cos = Math.cos(rotation)
  const sin = Math.sin(rotation)
  const segments = stroke.segments
  const totalSegments = segments.length
  const samplesPerSeg = SAMPLES_PER_SEGMENT
  const totalSamples = totalSegments * samplesPerSeg + 1

  // Collect sample points with normals and widths
  const points = []

  for (let si = 0; si < totalSegments; si++) {
    const seg = segments[si]
    const table = buildArcLengthTable(seg.p0, seg.p1, seg.p2, seg.p3, 32)
    const totalLen = arcLength(table)

    const count = si === totalSegments - 1 ? samplesPerSeg + 1 : samplesPerSeg
    for (let i = 0; i < count; i++) {
      const u = (i / samplesPerSeg) * totalLen
      const t = arcLengthToT(table, u)

      const pt = cubicBezier(seg.p0, seg.p1, seg.p2, seg.p3, t)
      const normal = cubicBezierNormal(seg.p0, seg.p1, seg.p2, seg.p3, t)

      // Global t across all segments
      const globalT = (si + t) / totalSegments

      // Width computation
      const baseWidth = stroke.baseWidth
      const taperW = taperProfile(globalT, taper)
      const velW = velocityProfile(globalT)
      const noiseW = 1 + noise.noise2D(globalT * 8 + noiseOffset, 0) * noiseAmount * 0.3
      const halfWidth = (baseWidth * taperW * velW * noiseW) / 2

      // Transform point: local → stroke space → glyph space → canvas space
      const sx = pt.x * strokeScale
      const sy = pt.y * strokeScale
      const rx = sx * cos - sy * sin + tx
      const ry = sx * sin + sy * cos + ty

      // Transform normal (rotation only)
      const rnx = normal.x * cos - normal.y * sin
      const rny = normal.x * sin + normal.y * cos

      // Scale to canvas
      const cx = rx * canvasScale + offsetX
      const cy = ry * canvasScale + offsetY

      // Normal scaled to canvas
      const halfW = (halfWidth / 40) * canvasScale

      // Noise displacement on polygon edges
      const edgeNoise = noise.noise2D(globalT * 12 + noiseOffset, 1.5) * noiseAmount * halfW * 0.2

      points.push({
        cx, cy,
        nx: rnx, ny: rny,
        halfW: halfW + edgeNoise,
      })
    }
  }

  if (points.length < 2) return

  // Build polygon: left edge forward, right edge backward
  ctx.beginPath()

  // Left edge
  const first = points[0]
  ctx.moveTo(
    first.cx + first.nx * first.halfW,
    first.cy + first.ny * first.halfW
  )
  for (let i = 1; i < points.length; i++) {
    const p = points[i]
    ctx.lineTo(
      p.cx + p.nx * p.halfW,
      p.cy + p.ny * p.halfW
    )
  }

  // Right edge (reverse)
  for (let i = points.length - 1; i >= 0; i--) {
    const p = points[i]
    ctx.lineTo(
      p.cx - p.nx * p.halfW,
      p.cy - p.ny * p.halfW
    )
  }

  ctx.closePath()
  ctx.fill()
}

/**
 * Render a complete glyph onto a canvas 2D context.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} glyph - Glyph object with positionedStrokes
 * @param {object[]} strokes - Stroke vocabulary
 * @param {object} params - Generation params (taper, etc.)
 * @param {object} options - { color, scale, offsetX, offsetY, noiseAmount }
 */
export function renderGlyph(ctx, glyph, strokes, params, options = {}) {
  const {
    color = DEFAULT_COLOR,
    scale = 200,
    offsetX = 0,
    offsetY = 0,
    noiseAmount = 0.3,
  } = options

  const noise = createNoise((glyph.id + 1) * 7919)

  // Center glyph within the canvas area using bounds
  const b = glyph.bounds || { x: 0, y: 0, w: 1, h: 1 }
  const fitScale = Math.min(1 / (b.w || 1), 1 / (b.h || 1), 1.5) * 0.8
  const centeredOffsetX = offsetX + (scale * (0.5 - (b.x + b.w / 2) * fitScale))
  const centeredOffsetY = offsetY + (scale * (0.5 - (b.y + b.h / 2) * fitScale))
  const effectiveScale = scale * fitScale

  ctx.save()
  ctx.fillStyle = color

  for (let i = 0; i < glyph.positionedStrokes.length; i++) {
    const ps = glyph.positionedStrokes[i]
    const stroke = strokes[ps.strokeIdx]
    if (!stroke) continue

    renderStroke(ctx, stroke, ps.transform, params, {
      scale: effectiveScale, offsetX: centeredOffsetX, offsetY: centeredOffsetY, noiseAmount,
    }, noise, i * 10)
  }

  ctx.restore()
}

/**
 * Render a glyph with animation progress.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} glyph
 * @param {object[]} strokes
 * @param {object} params
 * @param {number} progress - 0 (nothing) to 1 (complete)
 * @param {object} options
 */
export function renderGlyphAnimated(ctx, glyph, strokes, params, progress, options = {}) {
  const {
    color = DEFAULT_COLOR,
    scale = 200,
    offsetX = 0,
    offsetY = 0,
    noiseAmount = 0.3,
  } = options

  if (progress <= 0) return

  const noise = createNoise((glyph.id + 1) * 7919)
  const totalStrokes = glyph.positionedStrokes.length
  if (totalStrokes === 0) return

  // Center glyph within the canvas area using bounds
  const b = glyph.bounds || { x: 0, y: 0, w: 1, h: 1 }
  const fitScale = Math.min(1 / (b.w || 1), 1 / (b.h || 1), 1.5) * 0.8
  const centeredOffsetX = offsetX + (scale * (0.5 - (b.x + b.w / 2) * fitScale))
  const centeredOffsetY = offsetY + (scale * (0.5 - (b.y + b.h / 2) * fitScale))
  const effectiveScale = scale * fitScale

  // How many full strokes + partial progress on the current one
  const strokeProgress = progress * totalStrokes
  const fullStrokes = Math.floor(strokeProgress)
  const partialT = strokeProgress - fullStrokes

  ctx.save()
  ctx.fillStyle = color

  for (let i = 0; i < totalStrokes; i++) {
    if (i > fullStrokes) break // Not reached yet

    const ps = glyph.positionedStrokes[i]
    const stroke = strokes[ps.strokeIdx]
    if (!stroke) continue

    if (i < fullStrokes) {
      // Fully drawn
      renderStroke(ctx, stroke, ps.transform, params, {
        scale: effectiveScale, offsetX: centeredOffsetX, offsetY: centeredOffsetY, noiseAmount,
      }, noise, i * 10)
    } else {
      // Partially drawn — create a truncated stroke
      renderStrokePartial(ctx, stroke, ps.transform, params, {
        scale: effectiveScale, offsetX: centeredOffsetX, offsetY: centeredOffsetY, noiseAmount,
      }, noise, i * 10, partialT)
    }
  }

  ctx.restore()
}

/**
 * Render a stroke up to a given fraction of its total length.
 */
function renderStrokePartial(ctx, stroke, transform, params, options, noise, noiseOffset, fraction) {
  if (fraction <= 0) return

  const { taper = 0.5 } = params
  const { scale: canvasScale = 1, offsetX = 0, offsetY = 0, noiseAmount = 0.3 } = options
  const { x: tx, y: ty, scale: strokeScale, rotation } = transform

  const cos = Math.cos(rotation)
  const sin = Math.sin(rotation)
  const segments = stroke.segments
  const totalSegments = segments.length
  const samplesPerSeg = SAMPLES_PER_SEGMENT
  const totalSamples = totalSegments * samplesPerSeg + 1
  const maxSample = Math.floor(fraction * totalSamples)

  if (maxSample < 2) return

  const points = []
  let sampleCount = 0

  outer:
  for (let si = 0; si < totalSegments; si++) {
    const seg = segments[si]
    const table = buildArcLengthTable(seg.p0, seg.p1, seg.p2, seg.p3, 32)
    const totalLen = arcLength(table)

    const count = si === totalSegments - 1 ? samplesPerSeg + 1 : samplesPerSeg
    for (let i = 0; i < count; i++) {
      if (sampleCount >= maxSample) break outer
      sampleCount++

      const u = (i / samplesPerSeg) * totalLen
      const t = arcLengthToT(table, u)

      const pt = cubicBezier(seg.p0, seg.p1, seg.p2, seg.p3, t)
      const normal = cubicBezierNormal(seg.p0, seg.p1, seg.p2, seg.p3, t)

      const globalT = (si + t) / totalSegments

      const baseWidth = stroke.baseWidth
      const taperW = taperProfile(globalT, taper)
      const velW = velocityProfile(globalT)
      const noiseW = 1 + noise.noise2D(globalT * 8 + noiseOffset, 0) * noiseAmount * 0.3
      const halfWidth = (baseWidth * taperW * velW * noiseW) / 2

      const sx = pt.x * strokeScale
      const sy = pt.y * strokeScale
      const rx = sx * cos - sy * sin + tx
      const ry = sx * sin + sy * cos + ty

      const rnx = normal.x * cos - normal.y * sin
      const rny = normal.x * sin + normal.y * cos

      const cx = rx * canvasScale + offsetX
      const cy = ry * canvasScale + offsetY

      const halfW = (halfWidth / 40) * canvasScale

      const edgeNoise = noise.noise2D(globalT * 12 + noiseOffset, 1.5) * noiseAmount * halfW * 0.2

      points.push({
        cx, cy,
        nx: rnx, ny: rny,
        halfW: halfW + edgeNoise,
      })
    }
  }

  if (points.length < 2) return

  ctx.beginPath()

  const first = points[0]
  ctx.moveTo(first.cx + first.nx * first.halfW, first.cy + first.ny * first.halfW)
  for (let i = 1; i < points.length; i++) {
    const p = points[i]
    ctx.lineTo(p.cx + p.nx * p.halfW, p.cy + p.ny * p.halfW)
  }
  for (let i = points.length - 1; i >= 0; i--) {
    const p = points[i]
    ctx.lineTo(p.cx - p.nx * p.halfW, p.cy - p.ny * p.halfW)
  }

  ctx.closePath()
  ctx.fill()
}
