// Seeded PRNG — splitmix32
// Deterministic random number generation from a 32-bit seed

export function createRng(seed) {
  let s = seed | 0

  function next() {
    s |= 0
    s = (s + 0x9e3779b9) | 0
    let t = s ^ (s >>> 16)
    t = Math.imul(t, 0x21f0aaad)
    t = t ^ (t >>> 15)
    t = Math.imul(t, 0x735a2d97)
    t = t ^ (t >>> 15)
    return (t >>> 0) / 4294967296
  }

  function float(min = 0, max = 1) {
    return min + next() * (max - min)
  }

  function int(min, max) {
    return Math.floor(float(min, max + 1))
  }

  function bool(probability = 0.5) {
    return next() < probability
  }

  function pick(arr) {
    return arr[Math.floor(next() * arr.length)]
  }

  function shuffle(arr) {
    const result = [...arr]
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]]
    }
    return result
  }

  function gaussian(mean = 0, stddev = 1) {
    const u1 = next()
    const u2 = next()
    const z = Math.sqrt(-2 * Math.log(u1 || 1e-10)) * Math.cos(2 * Math.PI * u2)
    return mean + z * stddev
  }

  return { next, float, int, bool, pick, shuffle, gaussian }
}

// Convert a string seed to a number
export function seedFromString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i)
    hash = ((hash << 5) - hash + c) | 0
  }
  return hash
}
