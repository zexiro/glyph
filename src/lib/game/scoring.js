// Scoring — points, streaks, and titles

const TITLES = [
  { threshold: 0,    title: 'Novice Scribe' },
  { threshold: 0.4,  title: 'Apprentice' },
  { threshold: 0.6,  title: 'Scholar' },
  { threshold: 0.75, title: 'Linguist' },
  { threshold: 0.9,  title: 'Oracle' },
]

/**
 * Calculate score for a single challenge answer.
 * @param {boolean} correct
 * @param {number|null} timeRemaining - seconds remaining (null if untimed)
 * @param {number|null} timeLimit - total seconds allowed (null if untimed)
 * @param {string} challengeType
 * @param {number} currentStreak
 * @returns {{ points: number, newStreak: number }}
 */
export function calculateScore(correct, timeRemaining, timeLimit, challengeType, currentStreak) {
  if (!correct) {
    return { points: 0, newStreak: 0 }
  }

  let base = 100
  if (challengeType === 'inference') {
    base = 200
  }

  const newStreak = currentStreak + 1
  const streakMultiplier = Math.min(1 + newStreak * 0.1, 2.0)

  let timeBonus = 0
  if (timeLimit && timeRemaining != null) {
    timeBonus = (timeRemaining / timeLimit) * 50
  }

  const points = Math.round(base * streakMultiplier + timeBonus)
  return { points, newStreak }
}

/**
 * Get title based on accuracy ratio (0-1).
 */
export function getTitle(accuracy) {
  let result = TITLES[0].title
  for (const { threshold, title } of TITLES) {
    if (accuracy >= threshold) {
      result = title
    }
  }
  return result
}

export { TITLES }
