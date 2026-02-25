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
</style>
