<script>
  import { startGame } from '../lib/game/engine.js'
  import { preferences } from '../lib/stores/preferences.svelte.js'
  import { getAudioEngine } from '../lib/audio/AudioEngine.js'
  import { gameState } from '../lib/stores/game.svelte.js'

  let seedInput = $state('')

  function handleBegin() {
    // Init audio on first user gesture
    if (preferences.soundEnabled) {
      const audio = getAudioEngine()
      audio.init()
    }
    startGame(seedInput.trim() || '')
  }

  function handleKeydown(e) {
    if (e.key === 'Enter') handleBegin()
  }
</script>

<div class="menu">
  <div class="title-block">
    <h1 class="title">GLYPH</h1>
    <p class="subtitle">Learn a language that never existed</p>
  </div>

  <div class="controls">
    <input
      type="text"
      class="seed-input"
      placeholder="Seed (optional)"
      bind:value={seedInput}
      onkeydown={handleKeydown}
      aria-label="Session seed"
    />

    <button class="begin-btn" onclick={handleBegin}>
      Begin
    </button>

    <button class="sound-toggle" onclick={() => preferences.toggleSound()}>
      {preferences.soundEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
    </button>
  </div>

  <p class="flavor">Each session generates a unique writing system with internal logic.<br/>Can you learn to read it?</p>

  <button class="about-link" onclick={() => gameState.phase = 'about'}>About Glyph</button>
</div>

<style>
  .menu {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    text-align: center;
    max-width: 400px;
    width: 100%;
  }

  .title-block {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .title {
    font-size: 3.5rem;
    font-weight: 900;
    letter-spacing: 0.2em;
    color: var(--stroke);
    text-shadow: 0 0 40px rgba(212, 168, 87, 0.2);
  }

  .subtitle {
    font-size: 1rem;
    color: var(--text-dim);
    font-weight: 400;
    font-style: italic;
  }

  .controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    width: 100%;
  }

  .seed-input {
    width: 100%;
    max-width: 240px;
    padding: 0.6rem 1rem;
    border-radius: var(--radius);
    background: var(--bg-surface);
    border: 1px solid rgba(245, 230, 200, 0.1);
    color: var(--text);
    font-size: 0.9rem;
    text-align: center;
    font-family: inherit;
    outline: none;
    transition: border-color var(--transition);
  }
  .seed-input:focus {
    border-color: var(--accent);
  }
  .seed-input::placeholder {
    color: var(--text-dim);
  }

  .begin-btn {
    padding: 0.8rem 3rem;
    font-size: 1.1rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    background: var(--accent);
    color: var(--bg-deep);
    border-radius: var(--radius);
    transition: transform var(--transition), box-shadow var(--transition);
  }
  .begin-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 24px rgba(212, 168, 87, 0.3);
  }
  .begin-btn:active {
    transform: translateY(0);
  }

  .sound-toggle {
    font-size: 0.8rem;
    color: var(--text-dim);
    padding: 0.4rem 0.8rem;
    border-radius: 999px;
    transition: color var(--transition);
  }
  .sound-toggle:hover {
    color: var(--text);
  }

  .flavor {
    font-size: 0.8rem;
    color: var(--text-dim);
    line-height: 1.5;
    opacity: 0.6;
  }

  .about-link {
    font-size: 0.8rem;
    color: var(--text-dim);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    transition: color var(--transition);
  }
  .about-link:hover {
    color: var(--text);
  }
</style>
