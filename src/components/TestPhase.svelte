<script>
  import { gameState } from '../lib/stores/game.svelte.js'
  import { preferences } from '../lib/stores/preferences.svelte.js'
  import { submitAnswer, getMeanings } from '../lib/game/engine.js'
  import { getRoundConfig } from '../lib/game/progression.js'
  import { getAudioEngine } from '../lib/audio/AudioEngine.js'
  import { playCorrect, playIncorrect, playStreak } from '../lib/audio/feedback.js'
  import GlyphCard from './GlyphCard.svelte'
  import MeaningBadge from './MeaningBadge.svelte'
  import AnswerGrid from './AnswerGrid.svelte'
  import TimerBar from './TimerBar.svelte'
  import Header from './Header.svelte'

  const system = $derived(gameState.writingSystem)
  const challenges = $derived(gameState.challenges)
  const challengeIndex = $derived(gameState.challengeIndex)
  const challenge = $derived(challenges[challengeIndex])
  const config = $derived(getRoundConfig(gameState.round))
  const meanings = $derived(getMeanings())

  let disabled = $state(false)
  let feedbackIndex = $state(-1)
  let feedbackCorrect = $state(false)
  let getTimeRemaining = $state(null)
  let recentFrequencies = $state([])

  // Sequence challenge state
  let sequenceShowing = $state(true)
  let sequenceOrder = $state([])
  let sequenceShowTimeout = $state(null)

  $effect(() => {
    // Reset state when challenge changes
    if (challenge) {
      disabled = false
      feedbackIndex = -1
      feedbackCorrect = false
      if (challenge.type === 'sequence') {
        sequenceShowing = true
        sequenceOrder = []
        sequenceShowTimeout = setTimeout(() => {
          sequenceShowing = false
        }, 2500)
      }
    }
    return () => {
      if (sequenceShowTimeout) clearTimeout(sequenceShowTimeout)
    }
  })

  function handleSelect(option, index) {
    if (disabled) return
    disabled = true

    const timeRemaining = getTimeRemaining?.() ?? null
    let answer

    if (challenge.type === 'recall' || challenge.type === 'inference') {
      answer = { meaning: option, timeRemaining }
    } else if (challenge.type === 'reverse') {
      answer = { glyphId: option, timeRemaining }
    }

    const result = submitAnswer(answer)
    feedbackIndex = index
    feedbackCorrect = result.correct

    // Play audio feedback
    if (preferences.soundEnabled) {
      const audio = getAudioEngine()
      if (audio.context) {
        if (result.correct) {
          playCorrect(audio.context, audio.master)
          if (gameState.streak >= 3) {
            playStreak(audio.context, audio.master, recentFrequencies)
          }
        } else {
          playIncorrect(audio.context, audio.master)
        }
      }
    }

    // Brief delay before next challenge
    setTimeout(() => {
      feedbackIndex = -1
      disabled = false
    }, 600)
  }

  function handleSequenceTap(glyphId) {
    if (sequenceShowing || disabled) return
    sequenceOrder = [...sequenceOrder, glyphId]

    if (sequenceOrder.length >= challenge.correctOrder.length) {
      disabled = true
      const timeRemaining = getTimeRemaining?.() ?? null
      const result = submitAnswer({ order: sequenceOrder, timeRemaining })
      feedbackCorrect = result.correct

      if (preferences.soundEnabled) {
        const audio = getAudioEngine()
        if (audio.context) {
          result.correct
            ? playCorrect(audio.context, audio.master)
            : playIncorrect(audio.context, audio.master)
        }
      }

      setTimeout(() => {
        disabled = false
        sequenceOrder = []
      }, 600)
    }
  }

  function handleTimerExpire() {
    if (!disabled) {
      disabled = true
      submitAnswer({ meaning: null, glyphId: null, order: [], timeRemaining: 0 })
      setTimeout(() => { disabled = false }, 400)
    }
  }

  function getGlyphById(id) {
    return system?.glyphs?.find(g => g.id === id)
  }
</script>

<div class="test-phase">
  <Header />
  <TimerBar timeLimit={config.timeLimit} active={!disabled} onExpire={handleTimerExpire} bind:getTimeRemaining />

  {#if challenge}
    {#if challenge.type === 'recall' || challenge.type === 'inference'}
      {@const glyph = getGlyphById(challenge.glyphId)}
      <div class="prompt-area">
        {#if glyph}
          <GlyphCard {glyph} systemParams={system.params} strokes={system.strokes} size={160} animate={challenge.type === 'inference'} />
        {/if}
        {#if challenge.type === 'inference' && challenge.radicalHint}
          <p class="hint">{challenge.radicalHint}</p>
        {/if}
        <p class="question">What does this glyph mean?</p>
      </div>
      <AnswerGrid
        options={challenge.options}
        type="meaning"
        onSelect={handleSelect}
        {disabled}
        {feedbackIndex}
        {feedbackCorrect}
      />

    {:else if challenge.type === 'reverse'}
      <div class="prompt-area">
        <MeaningBadge meaning={challenge.meaning} size="lg" />
        <p class="question">Which glyph means this?</p>
      </div>
      <AnswerGrid
        options={challenge.options}
        type="glyph"
        onSelect={handleSelect}
        {disabled}
        systemParams={system.params}
        strokes={system.strokes}
        glyphs={system.glyphs}
        {feedbackIndex}
        {feedbackCorrect}
      />

    {:else if challenge.type === 'sequence'}
      <div class="prompt-area">
        <p class="question">{sequenceShowing ? 'Memorize this sequence' : 'Reproduce the sequence'}</p>
        <div class="sequence-row">
          {#each challenge.glyphIds as glyphId, i}
            {@const glyph = getGlyphById(glyphId)}
            {#if sequenceShowing}
              {#if glyph}
                <GlyphCard {glyph} systemParams={system.params} strokes={system.strokes} size={80} animate={true} />
              {/if}
            {:else}
              {@const selectedGlyph = sequenceOrder[i] != null ? getGlyphById(sequenceOrder[i]) : null}
              <div class="seq-slot" class:filled={selectedGlyph != null}>
                {#if selectedGlyph}
                  <GlyphCard glyph={selectedGlyph} systemParams={system.params} strokes={system.strokes} size={52} />
                {:else}
                  <span class="slot-number">{i + 1}</span>
                {/if}
              </div>
            {/if}
          {/each}
        </div>
        {#if !sequenceShowing}
          <div class="sequence-options">
            {#each gameState.currentGlyphs as glyph (glyph.id)}
              <button
                class="seq-option"
                class:selected={sequenceOrder.includes(glyph.id)}
                onclick={() => handleSequenceTap(glyph.id)}
                disabled={disabled || sequenceOrder.includes(glyph.id)}
              >
                <GlyphCard {glyph} systemParams={system.params} strokes={system.strokes} size={56} />
              </button>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  {:else}
    <p class="loading">Preparing challenge...</p>
  {/if}
</div>

<style>
  .test-phase {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 520px;
    gap: 1rem;
  }

  .prompt-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    margin: 0.5rem 0;
  }

  .question {
    font-size: 0.9rem;
    color: var(--text-dim);
    font-weight: 500;
  }

  .hint {
    font-size: 0.8rem;
    color: var(--accent);
    font-style: italic;
    opacity: 0.8;
  }

  .sequence-row {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
  }

  .seq-slot {
    width: 64px;
    height: 64px;
    border-radius: var(--radius);
    background: var(--bg-surface);
    border: 2px dashed rgba(245, 230, 200, 0.2);
    color: var(--text-dim);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color var(--transition), background var(--transition);
    overflow: hidden;
  }
  .seq-slot.filled {
    border-color: var(--accent);
    border-style: solid;
    background: rgba(212, 168, 87, 0.08);
  }
  .slot-number {
    font-size: 1.2rem;
    font-weight: 700;
    opacity: 0.4;
  }

  .sequence-options {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 0.75rem;
  }

  .seq-option {
    border-radius: var(--radius);
    padding: 0.25rem;
    background: var(--bg-surface);
    border: 2px solid transparent;
    transition: border-color var(--transition), opacity var(--transition);
  }
  .seq-option:hover:not(:disabled) {
    border-color: rgba(212, 168, 87, 0.3);
  }
  .seq-option.selected {
    opacity: 0.3;
    pointer-events: none;
  }

  .loading {
    color: var(--text-dim);
    font-style: italic;
  }
</style>
