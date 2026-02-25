// Difficulty curve — round configurations

const ROUND_CONFIGS = [
  { newGlyphCount: 3, testType: 'recall',    timeLimit: null, optionCount: 3 },
  { newGlyphCount: 2, testType: 'recall',    timeLimit: 8,    optionCount: 4 },
  { newGlyphCount: 2, testType: 'reverse',   timeLimit: 6,    optionCount: 4 },
  { newGlyphCount: 2, testType: 'sequence',  timeLimit: null, optionCount: null },
  { newGlyphCount: 2, testType: 'inference', timeLimit: 10,   optionCount: 3 },
  { newGlyphCount: 1, testType: 'mixed',     timeLimit: 5,    optionCount: 5 },
]

export function getRoundConfig(round) {
  return ROUND_CONFIGS[Math.min(round, ROUND_CONFIGS.length - 1)]
}

export const TOTAL_ROUNDS = ROUND_CONFIGS.length
