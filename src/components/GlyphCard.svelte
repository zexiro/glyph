<script>
  import { renderGlyph, renderGlyphAnimated } from '../lib/glyph/renderer.js'
  import { preferences } from '../lib/stores/preferences.svelte.js'

  let { glyph, systemParams, strokes, size = 120, animate = false, onclick = null } = $props()

  let canvas = $state(null)
  let animProgress = $state(0)
  let animFrame = $state(null)

  function draw() {
    if (!canvas || !glyph || !strokes) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const padding = size * 0.1 * dpr
    const drawSize = size * dpr - padding * 2

    const opts = {
      color: '#F5E6C8',
      scale: drawSize,
      offsetX: padding,
      offsetY: padding,
      noiseAmount: 0.3,
    }

    if (animProgress < 1) {
      renderGlyphAnimated(ctx, glyph, strokes, systemParams, animProgress, opts)
    } else {
      renderGlyph(ctx, glyph, strokes, systemParams, opts)
    }
  }

  function startAnimation() {
    if (preferences.reducedMotion || !animate) {
      animProgress = 1
      draw()
      return
    }
    animProgress = 0
    const startTime = performance.now()
    const duration = 800

    function tick(now) {
      animProgress = Math.min((now - startTime) / duration, 1)
      draw()
      if (animProgress < 1) {
        animFrame = requestAnimationFrame(tick)
      }
    }
    animFrame = requestAnimationFrame(tick)
  }

  $effect(() => {
    if (canvas && glyph && strokes) {
      if (animate) {
        startAnimation()
      } else {
        animProgress = 1
        draw()
      }
    }
    return () => {
      if (animFrame) cancelAnimationFrame(animFrame)
    }
  })
</script>

{#if onclick}
  <button class="glyph-card interactive" onclick={onclick} aria-label="Glyph symbol">
    <canvas bind:this={canvas}></canvas>
  </button>
{:else}
  <div class="glyph-card">
    <canvas bind:this={canvas}></canvas>
  </div>
{/if}

<style>
  .glyph-card {
    background: var(--bg-surface);
    border-radius: var(--radius);
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform var(--transition), box-shadow var(--transition);
    border: 1px solid rgba(245, 230, 200, 0.08);
  }
  .glyph-card.interactive:hover {
    transform: scale(1.03);
    box-shadow: 0 0 20px rgba(212, 168, 87, 0.15);
  }
  .glyph-card.interactive:active {
    transform: scale(0.97);
  }
  canvas {
    border-radius: calc(var(--radius) - 1px);
  }
</style>
