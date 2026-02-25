<script>
  import { gameState } from '../lib/stores/game.svelte.js'
  import { preferences } from '../lib/stores/preferences.svelte.js'
  import { advanceToTest, getMeanings } from '../lib/game/engine.js'
  import { getAudioEngine } from '../lib/audio/AudioEngine.js'
  import { playGlyphTone } from '../lib/audio/tones.js'
  import GlyphCard from './GlyphCard.svelte'
  import MeaningBadge from './MeaningBadge.svelte'
  import Header from './Header.svelte'

  const system = $derived(gameState.writingSystem)
  const newGlyphs = $derived(gameState.newGlyphs)
  const currentGlyphs = $derived(gameState.currentGlyphs)
  const previousGlyphs = $derived(
    currentGlyphs.filter(g => !newGlyphs.find(ng => ng.id === g.id))
  )
  const meanings = $derived(getMeanings())

  function handleGlyphTap(glyph) {
    if (!preferences.soundEnabled) return
    const audio = getAudioEngine()
    if (audio.context) {
      playGlyphTone(audio.context, audio.master, glyph.id)
    }
  }
</script>

<div class="learn-phase">
  <Header />

  <p class="instruction">Learn these new glyphs</p>

  <div class="new-glyphs">
    {#each newGlyphs as glyph (glyph.id)}
      <div class="glyph-entry">
        <GlyphCard
          {glyph}
          systemParams={system.params}
          strokes={system.strokes}
          size={120}
          animate={true}
          onclick={() => handleGlyphTap(glyph)}
        />
        {#if meanings}
          <MeaningBadge meaning={meanings.get(glyph.id)} />
        {/if}
      </div>
    {/each}
  </div>

  {#if previousGlyphs.length > 0}
    <p class="section-label">Previously learned</p>
    <div class="prev-glyphs">
      {#each previousGlyphs as glyph (glyph.id)}
        <div class="prev-entry">
          <GlyphCard
            {glyph}
            systemParams={system.params}
            strokes={system.strokes}
            size={64}
            onclick={() => handleGlyphTap(glyph)}
          />
          {#if meanings}
            <MeaningBadge meaning={meanings.get(glyph.id)} size="sm" />
          {/if}
        </div>
      {/each}
    </div>
  {/if}

  <button class="ready-btn" onclick={advanceToTest}>
    Ready
  </button>
</div>

<style>
  .learn-phase {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 520px;
    gap: 1rem;
  }

  .instruction {
    font-size: 0.9rem;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 500;
  }

  .new-glyphs {
    display: flex;
    gap: 1.25rem;
    overflow-x: auto;
    padding: 0.5rem;
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }

  .glyph-entry {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .section-label {
    font-size: 0.75rem;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-top: 0.5rem;
    opacity: 0.6;
  }

  .prev-glyphs {
    display: flex;
    gap: 0.75rem;
    overflow-x: auto;
    padding: 0.25rem;
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }

  .prev-entry {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    flex-shrink: 0;
  }

  .ready-btn {
    margin-top: 1rem;
    padding: 0.7rem 2.5rem;
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    background: var(--accent);
    color: var(--bg-deep);
    border-radius: var(--radius);
    transition: transform var(--transition), box-shadow var(--transition);
  }
  .ready-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 20px rgba(212, 168, 87, 0.25);
  }
  .ready-btn:active {
    transform: translateY(0);
  }
</style>
