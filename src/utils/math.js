export function lerp(a, b, t) {
  return a + (b - a) * t
}

export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max)
}

export function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

export function inverseLerp(a, b, v) {
  return (v - a) / (b - a)
}

export function remap(inMin, inMax, outMin, outMax, v) {
  const t = inverseLerp(inMin, inMax, v)
  return lerp(outMin, outMax, t)
}

export function dist(x1, y1, x2, y2) {
  const dx = x2 - x1
  const dy = y2 - y1
  return Math.sqrt(dx * dx + dy * dy)
}

export const TAU = Math.PI * 2
