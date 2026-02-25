<script>
  let { score = 0, streak = 0 } = $props()
  let displayScore = $state(0)

  $effect(() => {
    // Animate score counting up
    const target = score
    const start = displayScore
    const diff = target - start
    if (diff === 0) return

    const duration = 400
    const startTime = performance.now()

    function tick(now) {
      const t = Math.min((now - startTime) / duration, 1)
      const eased = t * (2 - t) // ease-out quad
      displayScore = Math.round(start + diff * eased)
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
</script>

<div class="score-display">
  <span class="score-value">{displayScore}</span>
  {#if streak > 1}
    <span class="streak-badge">{streak}x</span>
  {/if}
</div>

<style>
  .score-display {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .score-value {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--accent);
    font-variant-numeric: tabular-nums;
  }
  .streak-badge {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--bg-deep);
    background: var(--accent);
    padding: 0.1rem 0.4rem;
    border-radius: 999px;
  }
</style>
