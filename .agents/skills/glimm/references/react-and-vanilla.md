# glimm outside the Next.js App Router

Three setups, in descending order of how often they come up. In every case
the rule from SKILL.md holds: **one entry point per app** — everything from
`glimm/react` here (never mix with `glimm/next` imports in the same tree).

## React SPA (Vite, CRA, react-router, TanStack Router…)

Mount the provider once at the top of the tree, then wrap your router's
navigation call in `sweep()`:

```tsx
// main.tsx
import { GlimmProvider } from 'glimm/react'

createRoot(document.getElementById('root')!).render(
  <GlimmProvider palette="prism">
    <App />
  </GlimmProvider>,
)
```

```tsx
// A sweep-aware link for react-router:
import { useNavigate, type To } from 'react-router-dom'
import { useGlimm } from 'glimm/react'

function SweepLink({ to, children }: { to: To; children: React.ReactNode }) {
  const navigate = useNavigate()
  const { sweep } = useGlimm()
  return (
    <a
      href={typeof to === 'string' ? to : '#'}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
        e.preventDefault()
        sweep(() => navigate(to))
      }}
    >
      {children}
    </a>
  )
}
```

`sweep(navigate, options?)` plays the band, runs your `navigate` callback so
the route change happens while the outgoing view is held, and returns a
`{ midpoint, done, cancel }` handle. The callback may return a promise; the
reveal waits for it. Keep the modifier-click guard — a sweep-wrapped
Cmd-click would hijack "open in new tab".

There is no `InterceptLinks` component in `glimm/react`, but the underlying
`interceptLinks(sweep, navigate, opts?)` function is exported from
`glimm/next` for Next apps. In a plain SPA, prefer an explicit link
component like the one above — router URL semantics vary too much for blanket
interception to be safe.

## Next.js Pages Router

`glimm/next` is built on `next/navigation` and is **App Router only**. On the
Pages Router, use `glimm/react` with `next/router`:

```tsx
// pages/_app.tsx
import { GlimmProvider } from 'glimm/react'

export default function App({ Component, pageProps }) {
  return (
    <GlimmProvider palette="azure">
      <Component {...pageProps} />
    </GlimmProvider>
  )
}
```

```tsx
import { useRouter } from 'next/router'
import { useGlimm } from 'glimm/react'

const router = useRouter()
const { sweep } = useGlimm()
sweep(() => router.push('/about'))
```

The Pages Router resolves `router.push` when the new page's code and data are
ready, which makes the midpoint handoff feel precise — await it by returning
the promise from the callback (as above, since `router.push` returns one).

## Vanilla JS / any other framework

The core needs no React. You own the canvas and the content swap:

```ts
import { createShader, playSweep } from 'glimm'

const canvas = document.querySelector('canvas#glimm')! as HTMLCanvasElement
// Position the canvas fixed, full-viewport, pointer-events: none, on top.
const ctrl = createShader({ canvas, direction: 'ltr' })

playSweep(ctrl, {
  palette: 'citrus',
  onMidpoint: () => swapPageContent(),   // your DOM/route swap
  onComplete: () => { /* idle; ctrl is reusable for the next sweep */ },
})
```

Important difference from the React adapters: `playSweep` is a **decorative
canvas sweep only** — it does not hold the outgoing page or mask the swap.
Content coordination (View-Transition masking, the curtain fallback, commit
waiting) lives in `GlimmProvider`. In vanilla, do the swap in `onMidpoint`
while the band covers the viewport center, and keep `sweepMs` at or above the
default so the swap hides under the band.

Alternate shader looks for the core: `createMeshShader` (vertex-displaced
mesh) and `createNamedropShader` (radial bulge reveal) — same `playSweep`
contract.

### Sweeping inside a container

A sweep can play inside one element (a card, a chart, a table) instead of
the page: position the canvas absolutely over that element, sized to it,
with `pointer-events: none`. Always fade the band towards the box's edges —
a band that stops dead at the border reads as clipped, not designed.

- **glimm with `feather`** (check `createShader`'s options in
  `node_modules/glimm/dist/index.d.ts`): nothing to do, it defaults to
  `'auto'` and fades over 24 px inside containers. Pass a number to widen it
  for large boxes; never pass `0` for a contained canvas.
- **glimm without `feather` (0.3.1 and earlier):** mask the canvas in CSS instead:

  ```css
  .glimm-canvas {
    mask-image: linear-gradient(to right, transparent, #000 24px, #000 calc(100% - 24px), transparent), linear-gradient(to bottom, transparent, #000 24px, #000 calc(100% - 24px), transparent); mask-composite: intersect;
  }
  ```

Keep real content clear of the faded margin (padding at least the feather
width), so the color fades out over empty space rather than across text.
