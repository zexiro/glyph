<script>
  import { preferences } from '../lib/stores/preferences.svelte.js'

  let { timeLimit, onExpire, active = true, getTimeRemaining = $bindable(null) } = $props()

  let progress = $state(1)
  let intervalId = $state(null)
  let startTime = $state(null)

  // Expose getTimeRemaining via bindable prop
  getTimeRemaining = () => {
    if (!timeLimit) return null
    return Math.max(0, progress * timeLimit)
  }

  $effect(() => {
    if (active && timeLimit) {
      progress = 1
      startTime = performance.now()
      intervalId = setInterval(() => {
        const elapsed = (performance.now() - startTime) / 1000
        progress = Math.max(0, 1 - elapsed / timeLimit)
        if (progress <= 0) {
          clearInterval(intervalId)
          onExpire?.()
        }
      }, 16)
    }
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  })
</script>

{#if timeLimit}
  <div class="timer-bar" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin="0" aria-valuemax="100">
    <div
      class="timer-fill"
      class:urgent={progress < 0.3}
      style:width="{progress * 100}%"
      style:transition={preferences.reducedMotion ? 'none' : undefined}
    ></div>
  </div>
{/if}

<style>
  .timer-bar {
    width: 100%;
    max-width: 480px;
    height: 4px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 2px;
    overflow: hidden;
    margin: 0.5rem 0;
  }
  .timer-fill {
    height: 100%;
    background: var(--accent);
    border-radius: 2px;
    transition: background 0.3s;
  }
  .timer-fill.urgent {
    background: var(--incorrect);
  }
</style>
