// Challenge generation — builds test challenges for each round

/**
 * Generate challenges for a round.
 * @param {object} config - Round config from progression.js
 * @param {object[]} currentGlyphs - All glyphs revealed so far (including new ones)
 * @param {object[]} newGlyphs - Glyphs introduced this round
 * @param {Map} meanings - glyphId → meaning mapping
 * @param {object} writingSystem - Full writing system (for inference challenges)
 * @param {object} rng - Seeded RNG
 * @returns {object[]} Array of challenge objects
 */
export function generateChallenges(config, currentGlyphs, newGlyphs, meanings, writingSystem, rng) {
  const { testType, optionCount } = config
  const challengeCount = testType === 'sequence' ? 3 : Math.min(4, Math.max(3, currentGlyphs.length))

  const generators = {
    recall: (used) => generateRecall(currentGlyphs, newGlyphs, meanings, optionCount, rng, used),
    reverse: (used) => generateReverse(currentGlyphs, newGlyphs, meanings, optionCount, rng, used),
    sequence: () => generateSequence(currentGlyphs, rng),
    inference: (used) => generateInference(currentGlyphs, meanings, writingSystem, optionCount, rng, used),
    mixed: (used) => generateMixed(currentGlyphs, newGlyphs, meanings, writingSystem, optionCount, rng, used),
  }

  const generate = generators[testType] || generators.recall
  const challenges = []
  const usedGlyphIds = new Set()

  for (let i = 0; i < challengeCount; i++) {
    const challenge = generate(usedGlyphIds)
    if (challenge) {
      challenges.push(challenge)
      // Track which glyph was tested to avoid repeats
      if (challenge.glyphId != null) usedGlyphIds.add(challenge.glyphId)
      if (challenge.correctGlyphId != null) usedGlyphIds.add(challenge.correctGlyphId)
    }
  }

  return challenges
}

function generateRecall(currentGlyphs, newGlyphs, meanings, optionCount, rng, usedGlyphIds = new Set()) {
  // Prefer testing new glyphs but also revisit old ones
  const pool = newGlyphs.length > 0 ? [...newGlyphs, ...rng.shuffle(currentGlyphs).slice(0, 1)] : currentGlyphs
  const unused = pool.filter(g => !usedGlyphIds.has(g.id))
  const target = rng.pick(unused.length > 0 ? unused : pool)
  const correctMeaning = meanings.get(target.id)
  const options = buildMeaningOptions(target.id, currentGlyphs, meanings, optionCount, rng)

  return {
    type: 'recall',
    glyphId: target.id,
    correctMeaning,
    options,
  }
}

function generateReverse(currentGlyphs, newGlyphs, meanings, optionCount, rng, usedGlyphIds = new Set()) {
  const pool = newGlyphs.length > 0 ? [...newGlyphs, ...rng.shuffle(currentGlyphs).slice(0, 1)] : currentGlyphs
  const unused = pool.filter(g => !usedGlyphIds.has(g.id))
  const target = rng.pick(unused.length > 0 ? unused : pool)
  const meaning = meanings.get(target.id)
  const options = buildGlyphOptions(target.id, currentGlyphs, optionCount, rng)

  return {
    type: 'reverse',
    meaning,
    correctGlyphId: target.id,
    options,
  }
}

function generateSequence(currentGlyphs, rng) {
  const seqLength = Math.min(rng.int(3, 4), currentGlyphs.length)
  const shuffled = rng.shuffle(currentGlyphs)
  const glyphIds = shuffled.slice(0, seqLength).map(g => g.id)

  return {
    type: 'sequence',
    glyphIds,
    correctOrder: [...glyphIds],
  }
}

function generateInference(currentGlyphs, meanings, writingSystem, optionCount, rng, usedGlyphIds = new Set()) {
  // Find a glyph from the writing system that hasn't been revealed yet
  const currentIds = new Set(currentGlyphs.map(g => g.id))
  const unseenGlyphs = writingSystem.glyphs.filter(g => !currentIds.has(g.id))

  if (unseenGlyphs.length === 0) {
    // Fallback to recall if all glyphs are revealed
    return {
      type: 'recall',
      glyphId: rng.pick(currentGlyphs).id,
      correctMeaning: meanings.get(rng.pick(currentGlyphs).id),
      options: buildMeaningOptions(rng.pick(currentGlyphs).id, currentGlyphs, meanings, optionCount, rng),
    }
  }

  const target = rng.pick(unseenGlyphs)

  // Infer meaning from radical patterns — same color family as known glyphs sharing radicals
  const sharedRadicalGlyph = currentGlyphs.find(g =>
    g.radicalIndices.some(rId => target.radicalIndices.includes(rId))
  )

  let correctMeaning
  if (sharedRadicalGlyph && meanings.has(sharedRadicalGlyph.id)) {
    const sharedMeaning = meanings.get(sharedRadicalGlyph.id)
    // Same color family, but unique shape+label
    const usedCombos = new Set(
      [...meanings.values()].map(m => `${m.shape}-${m.label}`)
    )
    const shapes = ['circle', 'triangle', 'square', 'diamond', 'star', 'wave', 'spiral', 'cross']
    const labels = ['flow', 'peak', 'root', 'echo', 'bloom', 'drift', 'void', 'spark']
    let shape = rng.pick(shapes)
    let label = rng.pick(labels)
    // Try to find unused combo
    for (let attempt = 0; attempt < 20; attempt++) {
      if (!usedCombos.has(`${shape}-${label}`)) break
      shape = rng.pick(shapes)
      label = rng.pick(labels)
    }
    correctMeaning = {
      color: sharedMeaning.color,
      colorName: sharedMeaning.colorName,
      shape,
      label,
    }
  } else {
    // No shared radical found — assign a random meaning
    correctMeaning = meanings.get(currentGlyphs[0].id)
  }

  // Temporarily register meaning for option building
  meanings.set(target.id, correctMeaning)
  const options = buildMeaningOptions(target.id, [...currentGlyphs, target], meanings, optionCount, rng)

  const radicalHint = target.radicalIndices.length > 0
    ? `Shares radicals with known glyphs`
    : 'No radical hints available'

  return {
    type: 'inference',
    glyphId: target.id,
    correctMeaning,
    options,
    radicalHint,
  }
}

function generateMixed(currentGlyphs, newGlyphs, meanings, writingSystem, optionCount, rng, usedGlyphIds = new Set()) {
  const types = ['recall', 'reverse', 'inference']
  const chosen = rng.pick(types)

  switch (chosen) {
    case 'recall':
      return generateRecall(currentGlyphs, newGlyphs, meanings, optionCount, rng, usedGlyphIds)
    case 'reverse':
      return generateReverse(currentGlyphs, newGlyphs, meanings, optionCount, rng, usedGlyphIds)
    case 'inference':
      return generateInference(currentGlyphs, meanings, writingSystem, optionCount, rng, usedGlyphIds)
  }
}

// Build distractor options for meaning-based challenges
function buildMeaningOptions(correctGlyphId, glyphs, meanings, count, rng) {
  const correct = meanings.get(correctGlyphId)
  const distractors = glyphs
    .filter(g => g.id !== correctGlyphId && meanings.has(g.id))
    .map(g => meanings.get(g.id))

  const shuffledDistractors = rng.shuffle(distractors).slice(0, count - 1)
  const options = [correct, ...shuffledDistractors]
  return rng.shuffle(options)
}

// Build distractor options for glyph-based challenges
function buildGlyphOptions(correctGlyphId, glyphs, count, rng) {
  const distractors = glyphs
    .filter(g => g.id !== correctGlyphId)
    .map(g => g.id)

  const shuffledDistractors = rng.shuffle(distractors).slice(0, count - 1)
  const options = [correctGlyphId, ...shuffledDistractors]
  return rng.shuffle(options)
}
