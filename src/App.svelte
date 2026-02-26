<script>
  import { gameState } from './lib/stores/game.svelte.js'
  import MenuScreen from './components/MenuScreen.svelte'
  import LearnPhase from './components/LearnPhase.svelte'
  import TestPhase from './components/TestPhase.svelte'
  import ResultsScreen from './components/ResultsScreen.svelte'

  const phase = $derived(gameState.phase)
</script>

<main>
  {#if phase === 'menu'}
    <MenuScreen />
  {:else if phase === 'learn'}
    <LearnPhase />
  {:else if phase === 'test'}
    <TestPhase />
  {:else if phase === 'results'}
    <ResultsScreen />
  {/if}
  <footer class="codehawks-footer">
    A <a href="https://www.codehawks.co.uk" target="_blank" rel="noopener noreferrer">CodeHawks</a> project
  </footer>
</main>

<style>
  main {
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }
  .codehawks-footer {
    position: fixed;
    bottom: 0.5rem;
    right: 0.75rem;
    font-size: 0.65rem;
    color: var(--text-dim);
  }
  .codehawks-footer a {
    color: var(--text-dim);
    text-decoration: none;
  }
  .codehawks-footer a:hover {
    color: var(--text);
  }
</style>
