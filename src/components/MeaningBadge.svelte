<script>
  let { meaning, size = 'md' } = $props()

  const SHAPE_PATHS = {
    circle: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z',
    triangle: 'M12 4 L20 20 L4 20 Z',
    square: 'M5 5h14v14H5z',
    diamond: 'M12 3 L21 12 L12 21 L3 12 Z',
    star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    wave: 'M2 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0',
    spiral: 'M12 12c0-1.1.9-2 2-2s2 .9 2 2-.9 3-3 3-4-.9-4-4 .9-5 5-5 6 .9 6 6',
    cross: 'M9 3v6H3v6h6v6h6v-6h6V9h-6V3z',
  }

  const isStroke = $derived(meaning?.shape === 'wave' || meaning?.shape === 'spiral')
</script>

<div class="meaning-badge {size}">
  <span class="color-dot" style:background={meaning?.color}></span>
  <svg viewBox="0 0 24 24" class="shape-icon" aria-hidden="true">
    <path
      d={SHAPE_PATHS[meaning?.shape] || SHAPE_PATHS.circle}
      fill={isStroke ? 'none' : meaning?.color}
      stroke={isStroke ? meaning?.color : 'none'}
      stroke-width={isStroke ? '2' : '0'}
      opacity="0.7"
    />
  </svg>
  <span class="label">{meaning?.label || ''}</span>
</div>

<style>
  .meaning-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.75rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.04);
    white-space: nowrap;
  }
  .meaning-badge.sm { font-size: 0.75rem; gap: 0.3rem; padding: 0.25rem 0.5rem; }
  .meaning-badge.md { font-size: 0.875rem; }
  .meaning-badge.lg { font-size: 1.1rem; gap: 0.6rem; padding: 0.5rem 1rem; }

  .color-dot {
    width: 0.7em;
    height: 0.7em;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .shape-icon {
    width: 1.2em;
    height: 1.2em;
    flex-shrink: 0;
  }

  .label {
    color: var(--text);
    font-weight: 500;
    text-transform: capitalize;
  }
</style>
