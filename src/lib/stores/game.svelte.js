// Reactive game state using Svelte 5 $state rune

function createGameState() {
  let phase = $state('menu')           // 'menu' | 'learn' | 'test' | 'results'
  let round = $state(0)                // current round (0-5)
  let seed = $state('')                // session seed string
  let numericSeed = $state(0)          // derived numeric seed

  let writingSystem = $state(null)     // generated writing system
  let currentGlyphs = $state([])       // glyphs revealed so far
  let newGlyphs = $state([])           // glyphs introduced this round

  let score = $state(0)
  let streak = $state(0)
  let maxStreak = $state(0)
  let correctCount = $state(0)
  let totalCount = $state(0)
  let roundResults = $state([])        // per-round accuracy

  let challengeIndex = $state(0)       // current challenge within a test phase
  let challenges = $state([])          // challenges for current round

  return {
    get phase() { return phase },
    set phase(v) { phase = v },

    get round() { return round },
    set round(v) { round = v },

    get seed() { return seed },
    set seed(v) { seed = v },

    get numericSeed() { return numericSeed },
    set numericSeed(v) { numericSeed = v },

    get writingSystem() { return writingSystem },
    set writingSystem(v) { writingSystem = v },

    get currentGlyphs() { return currentGlyphs },
    set currentGlyphs(v) { currentGlyphs = v },

    get newGlyphs() { return newGlyphs },
    set newGlyphs(v) { newGlyphs = v },

    get score() { return score },
    set score(v) { score = v },

    get streak() { return streak },
    set streak(v) { streak = v },

    get maxStreak() { return maxStreak },
    set maxStreak(v) { maxStreak = v },

    get correctCount() { return correctCount },
    set correctCount(v) { correctCount = v },

    get totalCount() { return totalCount },
    set totalCount(v) { totalCount = v },

    get roundResults() { return roundResults },
    set roundResults(v) { roundResults = v },

    get challengeIndex() { return challengeIndex },
    set challengeIndex(v) { challengeIndex = v },

    get challenges() { return challenges },
    set challenges(v) { challenges = v },

    reset() {
      phase = 'menu'
      round = 0
      seed = ''
      numericSeed = 0
      writingSystem = null
      currentGlyphs = []
      newGlyphs = []
      score = 0
      streak = 0
      maxStreak = 0
      correctCount = 0
      totalCount = 0
      roundResults = []
      challengeIndex = 0
      challenges = []
    }
  }
}

export const gameState = createGameState()
