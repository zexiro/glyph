<script>
  import { gameState } from '../lib/stores/game.svelte.js'
  import { preferences } from '../lib/stores/preferences.svelte.js'
  import { getPlayerTitle, getMeanings, startGame } from '../lib/game/engine.js'
  import GlyphCard from './GlyphCard.svelte'
  import MeaningBadge from './MeaningBadge.svelte'

  const system = $derived(gameState.writingSystem)
  const title = $derived(getPlayerTitle())
  const accuracy = $derived(
    gameState.totalCount > 0
      ? Math.round((gameState.correctCount / gameState.totalCount) * 100)
      : 0
  )
  const meanings = $derived(getMeanings())
  let copied = $state(false)

  function playAgain() {
    startGame('')
  }

  function replaySeed() {
    startGame(gameState.seed)
  }

  async function shareSeed() {
    const text = `Glyph seed: ${gameState.seed}`
    try {
      await navigator.clipboard.writeText(text)
      copied = true
      setTimeout(() => { copied = false }, 2000)
    } catch {
      // Fallback
    }
  }
</script>

<div class="results">
  <div class="title-section">
    <p class="earned-label">You are</p>
    <h2 class="earned-title">{title}</h2>
  </div>

  <div class="stats-row">
    <div class="stat">
      <span class="stat-value">{accuracy}%</span>
      <span class="stat-label">Accuracy</span>
    </div>
    <div class="stat">
      <span class="stat-value">{gameState.score}</span>
      <span class="stat-label">Score</span>
    </div>
    <div class="stat">
      <span class="stat-value">{gameState.maxStreak}</span>
      <span class="stat-label">Best Streak</span>
    </div>
  </div>

  <div class="round-bars">
    {#each gameState.roundResults as result, i}
      <div class="round-bar-row">
        <span class="round-label">R{i + 1}</span>
        <div class="bar-track">
          <div class="bar-fill" style:width="{result.accuracy * 100}%"></div>
        </div>
      </div>
    {/each}
  </div>

  <p class="section-title">The Writing System</p>
  <div class="system-grid">
    {#if system}
      {#each system.glyphs as glyph (glyph.id)}
        {#if meanings?.has(glyph.id)}
          <div class="system-entry">
            <GlyphCard {glyph} systemParams={system.params} strokes={system.strokes} size={64} />
            <MeaningBadge meaning={meanings.get(glyph.id)} size="sm" />
          </div>
        {/if}
      {/each}
    {/if}
  </div>

  <div class="actions">
    <button class="primary-btn" onclick={playAgain}>
      New Game
    </button>
    <button class="secondary-btn" onclick={replaySeed}>
      Replay Seed
    </button>
    <button class="secondary-btn" onclick={shareSeed}>
      {copied ? 'Copied!' : `Share Seed: ${gameState.seed}`}
    </button>
    <button class="sound-toggle" onclick={() => preferences.toggleSound()}>
      {preferences.soundEnabled ? '🔊' : '🔇'}
    </button>
  </div>
</div>

<style>
  .results {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 520px;
    gap: 1.25rem;
    padding-bottom: 2rem;
  }

  .title-section {
    text-align: center;
  }
  .earned-label {
    font-size: 0.85rem;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 0.25rem;
  }
  .earned-title {
    font-size: 2rem;
    font-weight: 900;
    color: var(--accent);
    text-shadow: 0 0 30px rgba(212, 168, 87, 0.2);
  }

  .stats-row {
    display: flex;
    gap: 2rem;
  }
  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.15rem;
  }
  .stat-value {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--stroke);
    font-variant-numeric: tabular-nums;
  }
  .stat-label {
    font-size: 0.7rem;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .round-bars {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }
  .round-bar-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .round-label {
    font-size: 0.7rem;
    color: var(--text-dim);
    width: 1.5rem;
    text-align: right;
  }
  .bar-track {
    flex: 1;
    height: 6px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 3px;
    overflow: hidden;
  }
  .bar-fill {
    height: 100%;
    background: var(--correct);
    border-radius: 3px;
    transition: width 0.5s ease-out;
  }

  .section-title {
    font-size: 0.8rem;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-top: 0.5rem;
  }

  .system-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 0.75rem;
    width: 100%;
  }
  .system-entry {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem;
    background: var(--bg-surface);
    border-radius: var(--radius);
  }

  .actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    margin-top: 0.5rem;
  }
  .primary-btn {
    padding: 0.7rem 2.5rem;
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    background: var(--accent);
    color: var(--bg-deep);
    border-radius: var(--radius);
    transition: transform var(--transition);
  }
  .primary-btn:hover {
    transform: translateY(-1px);
  }
  .secondary-btn {
    padding: 0.5rem 1.5rem;
    font-size: 0.85rem;
    color: var(--text-dim);
    border: 1px solid rgba(245, 230, 200, 0.15);
    border-radius: var(--radius);
    transition: color var(--transition), border-color var(--transition);
  }
  .secondary-btn:hover {
    color: var(--text);
    border-color: var(--accent);
  }
  .sound-toggle {
    font-size: 1.2rem;
    padding: 0.3rem;
  }
</style>
