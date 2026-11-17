# Tuning glimm — timing, palettes, feel

Every option below works three ways: as a prop on `<GlimmProvider>` (the
app-wide default), in the `sweep` prop of a `<TransitionLink>` /
`<InterceptLinks sweep={...}>`, or as the second argument to `sweep()` /
`useTransitionRouter().push()`. Per-call options merge over provider defaults.

## The options

| Option        | Default  | Notes |
| ------------- | -------- | ----- |
| `sweepMs`     | `1100`   | ms for the band to cross the viewport |
| `outroMs`     | `220`    | ms for the post-reveal fade-out |
| `midpoint`    | `0.56`   | 0–1 progress where navigation fires |
| `palette`     | `spectrum` (`prism` before 0.4) | preset name or a custom `Palette` |
| `direction`   | `ltr`    | `ltr` \| `rtl` \| `ttb` \| `btt` |
| `easing`      | `ease`   | preset name or `(p) => number` |
| `peakAlpha`   | `1`      | caps the band's peak opacity |
| `brightness`  | `1`      | 0–1.5 multiplier on band RGB — lower on dark themes |
| `waveAmount`  | `0`      | 0–2 edge displacement; 0 is a straight edge |
| `rippleAmount`| `1`      | 0–2 vertical ripple texture inside the band |
| `waveSpeed`   | `1`      | 0–3 multiplier on time-based motion |
| `swellAmount` | `0.55`   | 0–1 depth swell |
| `bandTight`   | —        | band sharpness |
| `reducedMotion` | `'instant'` | provider-only; `'sweep'` plays anyway (don't, unless asked) |
| `zIndex`      | `9999`   | provider-only; canvas overlay stacking |

Easings: `linear`, `ease`, `easeOutQuart`, `easeOutCubic`, `easeInCubic`,
`easeInOutCubic`, `easeOutExpo`, `easeInOutQuint`, `snap`, `back`, or any
`(p: number) => number`. `cubicBezier(x1, y1, x2, y2)` is exported too.

## Feel recipes

Start from one of these rather than tweaking blind; each is a coherent
personality, not a grab bag:

**Default (balanced)** — ship as-is. `sweepMs: 1100` reads as deliberate
without dragging.

**Snappy** — content-dense sites, or a poor-fit project the user wants glimm
on anyway:

```tsx
<GlimmProvider palette="azure" sweepMs={650} outroMs={150} easing="easeOutExpo">
```

**Cinematic** — launch pages, portfolios with big imagery:

```tsx
<GlimmProvider palette="berry" sweepMs={1400} outroMs={300} easing="easeInOutQuint" swellAmount={0.8}>
```

**Subtle** — when the brand is quiet but the user still wants the mechanic:

```tsx
<GlimmProvider palette="lagoon" peakAlpha={0.85} brightness={0.9} rippleAmount={0.6}>
```

Keep `waveAmount` at 0 unless the user asks for a wavier edge — the straight
edge is the designed default and reads cleaner against text-heavy pages.

## Direction as meaning

Direction is cheap semantics. Common mappings that read instantly:

- `ltr` — forward / "next" (the default)
- `rtl` — back / "previous" (e.g., on a back-to-index link)
- `ttb` / `btt` — hierarchy shifts: descending into detail, surfacing to top

For an in-app moment, let direction follow the action instead: the band travels
away from whatever caused it, as described under "Size it to what changed" in
SKILL.md.

Per-link direction via `<TransitionLink sweep={{ direction: 'rtl' }}>`.
Don't mix more than two directions on one site; it stops reading as meaning
and starts reading as random.

## Custom palettes

`accentChain(hexes)` is the main tool — give it 2–4 brand hexes in the order
the sweep should pass through them. It interpolates in OKLCH (shortest hue
arc, perceptually even lightness) and least-squares-fits the shader's cosine
palette, so midpoints never go muddy the way RGB blends do:

```tsx
import { accentChain } from 'glimm/next'
const brand = accentChain(['#7C3AED', '#EC4899', '#F59E0B'])
<GlimmProvider palette={brand}>
```

Guidelines for choosing stops:

- Neighboring hues (blue→violet, yellow→orange) blend richest. Opposite hues
  (blue→orange) pass through gray — insert a bridge stop if the brand demands
  both ends.
- Very dark or very light brand hexes flatten the band. Prefer the brand's
  mid-lightness accent tones over its text/background colors.
- Two stops is already plenty; `berry` itself is only two.

Also exported: `accentPair(a, b)` (two named built-in accents),
`shuffleAccentPalette()` (random pair from the built-in accent set, good for
playful 404s), `PALETTES` (the preset map), `resolvePalette(name)`, and the
color math (`rgbToOklch`, `oklchToRgb`, `hexToRgb`) when you need to inspect
brand colors programmatically.

One palette per site unless there is a structural reason (e.g., a distinct
section with its own identity, or direction+palette pairing on back-links).
Per-page palette variety reads as indecision, not richness.

## Fit scoping patterns

For the "user wants glimm on a high-navigation app anyway" case from
SKILL.md Step 1, the combination that keeps it livable:

```tsx
<GlimmProvider palette="azure" sweepMs={650} outroMs={150}>
  <InterceptLinks />
```

plus `data-glimm-skip` on every sidebar/utility link so only top-level
section changes sweep. If the user later reports "it's too much", this is the
dial to point at before removal.
