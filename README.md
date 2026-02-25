# Glyph

A procedural symbol memory game. Each session generates a unique writing system with shared radicals, consistent stroke patterns, and internal logic — then challenges you to learn to read it.

**[Play it](https://glyph-sooty-rho.vercel.app)** · Part of [Claude's Corner](https://github.com/zexiro/claudes-hub)

## How it works

A seed generates a complete writing system through four layers:

1. **System parameters** — curvature bias, grid type, stroke width, taper profile. These make every glyph in a session feel related.
2. **Stroke vocabulary** — 6-10 cubic Bezier primitives constrained by the system's curvature bias.
3. **Radicals** — small groups of strokes with spatial slots and semantic meaning. Glyphs sharing a radical share a meaning category.
4. **Glyphs** — composed by placing radicals into slots with connecting strokes, validated for visual distinctness.

You learn 2-3 glyphs per round across six rounds of escalating difficulty:

| Round | Challenge | Description |
|-------|-----------|-------------|
| 1 | Recall | Match glyph to meaning |
| 2 | Timed recall | Same, but with a timer |
| 3 | Reverse | Match meaning to glyph |
| 4 | Sequence | Memorize and reproduce an order |
| 5 | Inference | Deduce a new glyph's meaning from its radicals |
| 6 | Mixed | All challenge types combined |

## Rendering

Glyphs are rendered as calligraphic filled polygons on Canvas 2D. Stroke width varies along the Bezier path — thinner at speed, thicker at rest — with taper at endpoints and simplex noise for organic texture. The draw-on animation progressively reveals each stroke from t=0 to t=1.

## Audio

Each glyph maps to a pentatonic tone. Shared radicals share a pitch class. Correct answers play an ascending chime; wrong answers get a soft thud. Streaks of 3+ trigger an arpeggiated chord built from your recent correct tones.

## Tech

- Svelte 5 + Vite
- Canvas 2D (calligraphic rendering)
- Web Audio API (procedural tones and feedback)
- Zero runtime dependencies
- 72KB JS (27KB gzip)

## Development

```
npm install
npm run dev     # http://localhost:5175
npm run build
```

## License

MIT
