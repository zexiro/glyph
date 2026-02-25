// Game loop and round management

import { gameState } from '../stores/game.svelte.js'
import { createRng, seedFromString } from '../../utils/rng.js'
import { generateWritingSystem } from '../glyph/system.js'
import { assignMeanings } from './meanings.js'
import { getRoundConfig, TOTAL_ROUNDS } from './progression.js'
import { generateChallenges } from './challenges.js'
import { calculateScore, getTitle } from './scoring.js'

let rng = null
let meanings = null

export function startGame(seedString) {
  gameState.reset()

  const seed = seedString || Math.random().toString(36).slice(2, 8)
  const numericSeed = seedFromString(seed)
  rng = createRng(numericSeed)

  const system = generateWritingSystem(seed)
  meanings = assignMeanings(rng, system.glyphs, system.radicals)

  gameState.seed = seed
  gameState.numericSeed = numericSeed
  gameState.writingSystem = system
  gameState.round = 0

  // Get first batch of glyphs
  const config = getRoundConfig(0)
  const firstGlyphs = system.glyphs.slice(0, config.newGlyphCount)
  gameState.newGlyphs = firstGlyphs
  gameState.currentGlyphs = firstGlyphs
  gameState.phase = 'learn'
}

export function advanceToTest() {
  const config = getRoundConfig(gameState.round)
  const challenges = generateChallenges(
    config,
    gameState.currentGlyphs,
    gameState.newGlyphs,
    meanings,
    gameState.writingSystem,
    rng
  )
  gameState.challenges = challenges
  gameState.challengeIndex = 0
  gameState.phase = 'test'
}

export function submitAnswer(answer) {
  const challenge = gameState.challenges[gameState.challengeIndex]
  if (!challenge) return { correct: false, points: 0 }

  const correct = checkAnswer(challenge, answer)
  const config = getRoundConfig(gameState.round)
  const { points, newStreak } = calculateScore(
    correct,
    answer.timeRemaining ?? null,
    config.timeLimit,
    challenge.type,
    gameState.streak
  )

  gameState.score += points
  gameState.streak = newStreak
  if (newStreak > gameState.maxStreak) {
    gameState.maxStreak = newStreak
  }
  gameState.totalCount += 1
  if (correct) {
    gameState.correctCount += 1
  }

  gameState.challengeIndex += 1

  // If last challenge in round, advance
  if (gameState.challengeIndex >= gameState.challenges.length) {
    // Record round result
    const roundChallenges = gameState.challenges.length
    const roundCorrect = correct
      ? (gameState.roundResults.length > 0 ? 1 : 1)
      : 0
    gameState.roundResults = [
      ...gameState.roundResults,
      {
        round: gameState.round,
        score: points,
        accuracy: gameState.correctCount / Math.max(1, gameState.totalCount),
      },
    ]
    nextRound()
  }

  return { correct, points }
}

function checkAnswer(challenge, answer) {
  switch (challenge.type) {
    case 'recall':
      return answer.meaning === challenge.correctMeaning
        || (answer.meaning && challenge.correctMeaning
          && answer.meaning.shape === challenge.correctMeaning.shape
          && answer.meaning.label === challenge.correctMeaning.label
          && answer.meaning.color === challenge.correctMeaning.color)

    case 'reverse':
      return answer.glyphId === challenge.correctGlyphId

    case 'sequence':
      return Array.isArray(answer.order)
        && answer.order.length === challenge.correctOrder.length
        && answer.order.every((id, i) => id === challenge.correctOrder[i])

    case 'inference':
      return answer.meaning === challenge.correctMeaning
        || (answer.meaning && challenge.correctMeaning
          && answer.meaning.shape === challenge.correctMeaning.shape
          && answer.meaning.label === challenge.correctMeaning.label
          && answer.meaning.color === challenge.correctMeaning.color)

    default:
      return false
  }
}

export function nextRound() {
  const nextRoundNum = gameState.round + 1
  if (nextRoundNum >= TOTAL_ROUNDS) {
    gameState.phase = 'results'
    return
  }

  gameState.round = nextRoundNum
  const config = getRoundConfig(nextRoundNum)
  const system = gameState.writingSystem

  // Figure out how many glyphs we've already shown
  const currentCount = gameState.currentGlyphs.length
  const newGlyphs = system.glyphs.slice(currentCount, currentCount + config.newGlyphCount)

  gameState.newGlyphs = newGlyphs
  gameState.currentGlyphs = [...gameState.currentGlyphs, ...newGlyphs]
  gameState.phase = 'learn'
}

export function getMeanings() {
  return meanings
}

export function getPlayerTitle() {
  return getTitle(gameState.correctCount / Math.max(1, gameState.totalCount))
}
