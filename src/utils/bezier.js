// Cubic Bezier utilities — sampling, arc-length parameterization, tangents

// Evaluate cubic bezier at parameter t
export function cubicBezier(p0, p1, p2, p3, t) {
  const mt = 1 - t
  const mt2 = mt * mt
  const t2 = t * t
  return {
    x: mt2 * mt * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t2 * t * p3.x,
    y: mt2 * mt * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t2 * t * p3.y,
  }
}

// Tangent (first derivative) of cubic bezier at t
export function cubicBezierTangent(p0, p1, p2, p3, t) {
  const mt = 1 - t
  return {
    x: 3 * mt * mt * (p1.x - p0.x) + 6 * mt * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x),
    y: 3 * mt * mt * (p1.y - p0.y) + 6 * mt * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y),
  }
}

// Normal perpendicular to tangent at t
export function cubicBezierNormal(p0, p1, p2, p3, t) {
  const tan = cubicBezierTangent(p0, p1, p2, p3, t)
  const len = Math.sqrt(tan.x * tan.x + tan.y * tan.y) || 1
  return { x: -tan.y / len, y: tan.x / len }
}

// Build arc-length lookup table for uniform sampling
export function buildArcLengthTable(p0, p1, p2, p3, segments = 64) {
  const table = new Float64Array(segments + 1)
  table[0] = 0
  let prev = cubicBezier(p0, p1, p2, p3, 0)

  for (let i = 1; i <= segments; i++) {
    const t = i / segments
    const pt = cubicBezier(p0, p1, p2, p3, t)
    const dx = pt.x - prev.x
    const dy = pt.y - prev.y
    table[i] = table[i - 1] + Math.sqrt(dx * dx + dy * dy)
    prev = pt
  }

  return table
}

// Get total arc length
export function arcLength(table) {
  return table[table.length - 1]
}

// Map uniform distance u (0..totalLength) → parameter t
export function arcLengthToT(table, u) {
  const total = table[table.length - 1]
  if (u <= 0) return 0
  if (u >= total) return 1

  const segments = table.length - 1

  // Binary search
  let lo = 0, hi = segments
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (table[mid] < u) lo = mid + 1
    else hi = mid
  }

  const segIdx = Math.max(0, lo - 1)
  const segLen = table[segIdx + 1] - table[segIdx]
  if (segLen < 1e-10) return segIdx / segments

  const frac = (u - table[segIdx]) / segLen
  return (segIdx + frac) / segments
}

// Sample N uniformly-spaced points along the curve
export function sampleUniform(p0, p1, p2, p3, n, tableSegments = 64) {
  const table = buildArcLengthTable(p0, p1, p2, p3, tableSegments)
  const total = arcLength(table)
  const points = []

  for (let i = 0; i < n; i++) {
    const u = (i / (n - 1)) * total
    const t = arcLengthToT(table, u)
    points.push({ ...cubicBezier(p0, p1, p2, p3, t), t })
  }

  return points
}

// Evaluate a multi-segment bezier path (array of {p0,p1,p2,p3})
export function evalPath(segments, t) {
  const totalSegs = segments.length
  const scaledT = t * totalSegs
  const segIdx = Math.min(Math.floor(scaledT), totalSegs - 1)
  const localT = scaledT - segIdx
  const seg = segments[segIdx]
  return cubicBezier(seg.p0, seg.p1, seg.p2, seg.p3, localT)
}
