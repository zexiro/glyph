<script>
  import { gameState } from '../lib/stores/game.svelte.js'

  const round = $derived(gameState.round)
  const score = $derived(gameState.score)
  const streak = $derived(gameState.streak)
</script>

<header>
  <span class="round">Round {round + 1}/6</span>
  <div class="stats">
    {#if streak >= 3}
      <span class="streak" title="Streak: {streak}">🔥 {streak}x</span>
    {/if}
    <span class="score">{score}</span>
  </div>
</header>

<style>
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    max-width: 480px;
    padding: 0.5rem 0;
    margin-bottom: 0.5rem;
  }
  .round {
    font-size: 0.85rem;
    color: var(--text-dim);
    font-weight: 500;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .stats {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .streak {
    font-size: 0.85rem;
    color: var(--accent);
    font-weight: 600;
  }
  .score {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--accent);
    font-variant-numeric: tabular-nums;
  }
</style>
