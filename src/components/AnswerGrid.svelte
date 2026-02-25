<script>
  import GlyphCard from './GlyphCard.svelte'
  import MeaningBadge from './MeaningBadge.svelte'

  let { options = [], type = 'meaning', onSelect, disabled = false, systemParams = null, strokes = null, glyphs = null, feedbackIndex = -1, feedbackCorrect = false } = $props()
</script>

<div class="answer-grid" class:disabled style:grid-template-columns={options.length <= 3 ? `repeat(${options.length}, 1fr)` : 'repeat(2, 1fr)'}>
  {#each options as option, i}
    <button
      class="answer-option"
      class:correct={feedbackIndex === i && feedbackCorrect}
      class:incorrect={feedbackIndex === i && !feedbackCorrect}
      onclick={() => !disabled && onSelect?.(option, i)}
      {disabled}
    >
      {#if type === 'meaning'}
        <MeaningBadge meaning={option} size="lg" />
      {:else if type === 'glyph'}
        {@const glyph = glyphs?.find(g => g.id === option)}
        {#if glyph}
          <GlyphCard {glyph} {systemParams} {strokes} size={80} />
        {/if}
      {/if}
    </button>
  {/each}
</div>

<style>
  .answer-grid {
    display: grid;
    gap: 0.75rem;
    width: 100%;
    max-width: 480px;
  }
  .answer-option {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem;
    border-radius: var(--radius);
    background: var(--bg-surface);
    border: 2px solid transparent;
    transition: border-color var(--transition), background var(--transition), transform 0.15s;
    min-height: 56px;
    cursor: pointer;
  }
  .answer-option:hover:not(:disabled) {
    border-color: rgba(212, 168, 87, 0.3);
    background: rgba(255, 255, 255, 0.03);
  }
  .answer-option:active:not(:disabled) {
    transform: scale(0.97);
  }
  .answer-option.correct {
    border-color: var(--correct);
    background: rgba(91, 206, 166, 0.1);
  }
  .answer-option.incorrect {
    border-color: var(--incorrect);
    background: rgba(232, 116, 97, 0.1);
  }
  .disabled {
    pointer-events: none;
    opacity: 0.7;
  }
</style>
