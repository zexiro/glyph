function createPreferences() {
  let soundEnabled = $state(true)
  let reducedMotion = $state(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  )

  return {
    get soundEnabled() { return soundEnabled },
    set soundEnabled(v) { soundEnabled = v },
    toggleSound() { soundEnabled = !soundEnabled },

    get reducedMotion() { return reducedMotion },
    set reducedMotion(v) { reducedMotion = v },
  }
}

export const preferences = createPreferences()
