<script>
  import { gameState } from '../lib/stores/game.svelte.js'
</script>

<div class="about">
  <button class="back-link" onclick={() => gameState.phase = 'menu'}>
    &larr; Back to menu
  </button>

  <article class="about-content">
    <header>
      <h1>About Glyph</h1>
      <p class="lede">A procedural symbol memory game</p>
    </header>

    <section>
      <h2>What is Glyph?</h2>
      <p>
        Each session generates a unique writing system — one with shared radicals,
        consistent stroke patterns, and internal logic — then challenges you to
        learn to read it. Every system is seeded, so seeds are shareable: give a
        friend the same seed and they will face the exact same glyphs.
      </p>
    </section>

    <section>
      <h2>How it works</h2>
      <p>
        Generation runs through four layers: system parameters define the overall
        character of the script, a stroke vocabulary establishes the basic marks,
        radicals combine strokes into reusable building blocks, and finally glyphs
        assemble radicals into complete symbols with meanings.
      </p>
      <p>
        You then face six rounds of escalating difficulty: recall, timed recall,
        reverse, sequence, inference, and mixed. Each round introduces new glyphs
        while testing the ones you have already learned.
      </p>
    </section>

    <section>
      <h2>Rendering</h2>
      <p>
        Glyphs are drawn as calligraphic strokes on Canvas 2D with variable
        width and natural taper, giving each symbol an organic, hand-drawn feel.
      </p>
    </section>

    <section>
      <h2>Built at Claude's Corner</h2>
      <p>
        Glyph is part of
        <a href="https://claudescorner.dev" target="_blank" rel="noopener noreferrer">Claude's Corner</a>,
        built by
        <a href="https://claude.ai" target="_blank" rel="noopener noreferrer">Claude</a>.
        Source code is available on
        <a href="https://github.com/zexiro/glyph" target="_blank" rel="noopener noreferrer">GitHub</a>.
      </p>
    </section>

    <button class="cta-btn" onclick={() => gameState.phase = 'menu'}>
      Play Glyph
    </button>
  </article>
</div>

<style>
  .about {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 600px;
    padding: 2rem 1rem;
    overflow-y: auto;
    font-family: 'Inter', system-ui;
  }

  .back-link {
    align-self: flex-start;
    font-size: 0.85rem;
    color: var(--text-dim);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem 0;
    margin-bottom: 1.5rem;
    transition: color var(--transition);
  }
  .back-link:hover {
    color: var(--text);
  }

  .about-content {
    width: 100%;
  }

  header {
    margin-bottom: 2rem;
    text-align: center;
  }

  h1 {
    font-size: 2rem;
    font-weight: 800;
    color: var(--stroke);
    margin: 0 0 0.5rem;
  }

  .lede {
    font-size: 1rem;
    color: var(--text-dim);
    font-style: italic;
    margin: 0;
  }

  section {
    margin-bottom: 1.75rem;
  }

  h2 {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--accent);
    margin: 0 0 0.5rem;
  }

  p {
    font-size: 0.9rem;
    color: var(--text);
    line-height: 1.7;
    margin: 0 0 0.75rem;
  }

  a {
    color: var(--accent);
    text-decoration: none;
    transition: color var(--transition);
  }
  a:hover {
    color: var(--stroke);
  }

  .cta-btn {
    display: block;
    margin: 2rem auto 0;
    padding: 0.8rem 3rem;
    font-size: 1.1rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    background: var(--accent);
    color: var(--bg-deep);
    border: none;
    border-radius: var(--radius);
    cursor: pointer;
    transition: transform var(--transition), box-shadow var(--transition);
  }
  .cta-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 24px rgba(212, 168, 87, 0.3);
  }
  .cta-btn:active {
    transform: translateY(0);
  }
</style>
