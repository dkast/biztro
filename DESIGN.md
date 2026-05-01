---
name: Biztro
description: Digital menu management for hospitality teams — calm, fast, operationally clear.
colors:
  background: "oklch(1 0 0)"
  foreground: "oklch(0.145 0 0)"
  card: "oklch(1 0 0)"
  card-foreground: "oklch(0.145 0 0)"
  popover: "oklch(1 0 0)"
  popover-foreground: "oklch(0.145 0 0)"
  primary: "oklch(51.1% 0.262 276.966)"
  primary-foreground: "oklch(0.969 0.016 293.756)"
  secondary: "oklch(0.97 0 0)"
  secondary-foreground: "oklch(0.205 0 0)"
  muted: "oklch(0.97 0 0)"
  muted-foreground: "oklch(0.556 0 0)"
  accent: "oklch(0.97 0 0)"
  accent-foreground: "oklch(0.205 0 0)"
  destructive: "oklch(0.577 0.245 27.325)"
  destructive-foreground: "oklch(0.985 0 0)"
  border: "oklch(0.922 0 0)"
  input: "oklch(0.922 0 0)"
  ring: "oklch(67.3% 0.182 276.935)"
  sidebar: "oklch(0.985 0.002 247.839)"
  sidebar-foreground: "oklch(43.9% 0 0)"
  sidebar-border: "oklch(0.922 0 0)"
  status-success: "oklch(0.696 0.17 162.48)"
  status-warning: "oklch(0.828 0.189 84.429)"
  status-info: "oklch(0.6 0.118 184.704)"
  status-danger: "oklch(0.577 0.245 27.325)"
  chart-1: "oklch(0.646 0.222 41.116)"
  chart-2: "oklch(0.6 0.118 184.704)"
  chart-3: "oklch(0.398 0.07 227.392)"
  chart-4: "oklch(0.828 0.189 84.429)"
  chart-5: "oklch(0.769 0.188 70.08)"
typography:
  display:
    fontFamily: "var(--font-be-vietnam-pro), 'Be Vietnam Pro', ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 4vw, 2.5rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 112.5"
  headline:
    fontFamily: "var(--font-be-vietnam-pro), 'Be Vietnam Pro', ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "var(--font-inter), Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.01em"
  body:
    fontFamily: "var(--font-inter), Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "var(--font-inter), Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "0.01em"
rounded:
  sm: "calc(0.65rem - 4px)"
  md: "calc(0.65rem - 2px)"
  lg: "0.65rem"
  xl: "calc(0.65rem + 4px)"
  full: "9999px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.lg}"
    padding: "0.5rem 1rem"
    height: "2.5rem"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.primary}"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "0.5rem 1rem"
    height: "2.5rem"
  button-ghost:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "0.5rem 1rem"
  button-destructive:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.destructive-foreground}"
    rounded: "{rounded.lg}"
    padding: "0.5rem 1rem"
  input-default:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "0.25rem 0.75rem"
    height: "2.25rem"
  card-default:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.lg}"
    padding: "1.5rem"
  badge-neutral:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.muted-foreground}"
    rounded: "{rounded.md}"
    padding: "0.25rem 0.5rem"
    typography: "{typography.label}"
  badge-success:
    backgroundColor: "{colors.status-success}"
    textColor: "{colors.background}"
    rounded: "{rounded.md}"
  badge-danger:
    backgroundColor: "{colors.status-danger}"
    textColor: "{colors.destructive-foreground}"
    rounded: "{rounded.md}"
  sidebar-default:
    backgroundColor: "{colors.sidebar}"
    textColor: "{colors.sidebar-foreground}"
    width: "16rem"
---

# Design System: Biztro

## 1. Overview

**Creative North Star: "The Mise en Place"**

Biztro is the digital counterpart to a kitchen's _mise en place_ — every menu item, locale, price, and publish state in its right place, ready to act on the moment service starts. The interface earns trust by being calm, legible, and predictable. Operators come back to it many times per shift; nothing about the surface should compete with the task they're trying to finish.

The system is restrained by default. Surfaces are flat off‑white (`oklch(1 0 0)` light, `oklch(0.145 0 0)` dark) with subtle 1px borders (`oklch(0.922 0 0)`) doing the structural work that shadows would do in a flashier product. A single indigo primary (`oklch(51.1% 0.262 276.966)`) is reserved for the one action we want operators to commit to on each screen. Status colors (green, amber, red, blue, violet) carry meaning, never decoration; they live almost exclusively in badges, alerts, and the chart palette.

This explicitly rejects the dashboard tropes the category trains for: no neon‑on‑black crypto aesthetic, no gradient hero metrics, no gamified achievement flourishes, no template‑SaaS marketing decoration bolted onto admin screens. Hospitality teams update menus between covers — the screen needs to behave like a clean prep station, not a billboard.

**Key Characteristics:**

- Flat surfaces, hairline borders, sparing shadows
- One indigo accent — used like seasoning, not paint
- Semantic color reserved for status, not theming
- Two‑family typographic system (Be Vietnam Pro display, Inter UI)
- Dual‑theme (light default, dark supported) — both equally first‑class

## 2. Colors

A near‑monochrome canvas with a single committed indigo accent and a disciplined semantic palette for status. The system's identity comes from restraint, not from saturation.

### Primary

- **Service Indigo** (`oklch(51.1% 0.262 276.966)`): The product's one chromatic voice. Reserved for the primary action on a screen (Save, Publish, Confirm), the active sidebar item, focus rings, and selected states. Never used as a background fill on large surfaces.
- **Service Indigo (foreground)** (`oklch(0.969 0.016 293.756)`): The barely‑tinted near‑white that sits on Service Indigo — never `#fff`.

### Neutral

- **Paper White** (`oklch(1 0 0)`): Page background in light theme, card surfaces.
- **Ink** (`oklch(0.145 0 0)`): Body text and primary headings in light; page background in dark.
- **Mist** (`oklch(0.97 0 0)`): Muted/secondary/accent surfaces — chip backgrounds, hover fills, table zebra rows.
- **Stone** (`oklch(0.556 0 0)`): Muted body copy, helper text, placeholder text.
- **Rule** (`oklch(0.922 0 0)`): All borders and input strokes. The system's structural workhorse.
- **Sidebar Vellum** (`oklch(0.985 0.002 247.839)`): The one neutral with a faint cool tint — the navigation surface, separating it from card surfaces without raising the visual temperature.

### Status (semantic, reserved for badges and alerts)

- **Service Green** (`oklch(0.696 0.17 162.48)`): Published, healthy, success.
- **Amber Caution** (`oklch(0.828 0.189 84.429)`): Pending, warning, draft about to expire.
- **Pepper Red** (`oklch(0.577 0.245 27.325)`): Destructive, error, blocking.
- **Cool Blue** (`oklch(0.6 0.118 184.704)`): Information, secondary status.
- **Violet** (used in badges only): Tag/category accents that need to read separately from primary.

### Named Rules

**The One Voice Rule.** Service Indigo is the only chromatic accent on the operational surface. It covers ≤10% of any given screen. If two indigo elements compete for attention on the same screen, one of them is wrong.

**The Status‑Only Rule.** Greens, ambers, reds, blues, and violets exist to communicate state, not to theme. Never use them as decorative backgrounds, gradient stops, or hero accents.

**The Tinted Neutral Rule.** Sidebar Vellum carries a 0.002 chroma cool tint. Every other neutral is true grayscale. Don't push tint into card surfaces or page backgrounds — the contrast between Vellum and Paper is what makes navigation read as a separate plane.

## 3. Typography

**Display Font:** Be Vietnam Pro (with `ui-sans-serif`, `system-ui`, sans-serif fallback)
**Body Font:** Inter (with `ui-sans-serif`, `system-ui`, sans-serif fallback)

**Character:** Be Vietnam Pro is a humanist sans with subtle warmth and a slightly condensed cut at `wdth: 112.5` — operationally serious but not corporate-stiff. Inter handles dense UI labels, table cells, and form copy with the neutrality the work demands. The pairing is sharp where it needs voice (page titles, marketing) and quiet everywhere else (panels, lists, inputs).

### Hierarchy

- **Display** (Be Vietnam Pro, 600, `clamp(1.875rem, 4vw, 2.5rem)`, line-height 1.1, tracking -0.02em): Page hero titles, marketing surfaces, section openers.
- **Headline** (Be Vietnam Pro, 600, 1.5rem, line-height 1.2): Panel and dialog titles within the product.
- **Title** (Inter, 600, 1.25rem, line-height 1, tracking -0.01em): Card titles, list section headers.
- **Body** (Inter, 400, 0.875rem, line-height 1.5): Default UI text. Cap long-form passages at 65–75ch.
- **Label** (Inter, 500, 0.75rem, line-height 1.25, tracking 0.01em): Form labels, badges, table headers, meta lines.

### Named Rules

**The No-Gradient-Type Rule.** Type is solid color — Service Indigo, Ink, or Stone. Never `background-clip: text` with gradients. Emphasis comes from weight (500/600), size, or color shift, not from chrome.

**The Tracking Floor Rule.** Body text and smaller stays at neutral tracking. Negative tracking is reserved for Display, Headline, and Title (where the larger size warrants it). Don't tighten body for "polish" — it costs legibility on long shifts.

## 4. Elevation

The system is **flat by default with hairline structure**. Depth is conveyed primarily by 1px borders (`{colors.border}`) and `inset-ring` strokes — not by shadow. Shadows appear only where an element has genuinely lifted off the page (popovers, dropdowns, modals, sheets) or to give an input the faintest physical presence.

### Shadow Vocabulary

- **shadow-xs** (`box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05)`): Inputs, selects, textareas, toggle. The whisper-thin shelf that says "this accepts focus."
- **shadow-sm** (`box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)`): Default cards, sidebar inset variant, tab active state.
- **shadow-md** (`box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`): Popovers, hover cards, dropdown items, tooltips.
- **shadow-lg** (`box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`): Dialogs, alert dialogs, sheets, command palette — the only surfaces that feel decisively above the page.

### Named Rules

**The Border-First Rule.** When in doubt, use a 1px `{colors.border}` instead of a shadow. Shadows are reserved for elements that genuinely escape their plane.

**The No-Glow Rule.** No colored glows, no gradient halos, no decorative drop shadows behind hero numbers. Focus rings (a 3px `{colors.ring}/0.5` at offset 2) are the only colored emission allowed.

## 5. Components

### Buttons

- **Shape:** Rounded (8.4px / `rounded-lg`). Slightly softer than rectangle, never pill outside of icon contexts.
- **Primary:** Service Indigo background, near-white foreground, faint `inset-ring inset-ring-white/10` to add weight without a border. Default size 40px tall (`h-10`), 16px horizontal padding. Active state scales to 0.98 — the only motion baked into all buttons.
- **Outline:** Transparent background, `inset-ring inset-ring-input` (the input border tone), foreground in Ink. Hovers to Mist accent fill.
- **Ghost:** No background, foreground in Ink. Hovers to Mist. Used inside tables, list rows, and toolbars.
- **Destructive:** Pepper Red background, near-white foreground. Reserved for irreversible actions; never the default for "remove" inside lists.
- **Hover / Focus:** 90% opacity on the fill (`bg-primary/90`), `ring-2 ring-ring ring-offset-2` on focus-visible. Transitions colors only — never width/height/padding.
- **Sizes:** xs (32px), sm (36px), default (40px), lg (44px), plus matching square `icon` variants.

### Inputs / Fields

- **Shape:** Rounded (10.4px / `rounded-md`), 36px tall (`h-9`).
- **Style:** Transparent background, 1px `{colors.input}` border, `shadow-xs` for the smallest possible physical shelf.
- **Focus:** Border shifts to `{colors.ring}`, plus a 3px `{colors.ring}/0.5` ring. Transitions `color, box-shadow` only.
- **Error:** `aria-invalid` triggers a `{colors.destructive}/20` ring and `{colors.destructive}` border. No red fill, no shake — the ring is the signal.
- **Dark theme:** Background drops to `{colors.input}/30` so the field still reads as a depression, not a stroked outline floating over the page.

### Cards / Containers

- **Corner Style:** Rounded (10.4px / `rounded-lg`).
- **Background:** Paper White (`{colors.card}`).
- **Border:** 1px `{colors.border}`. Always present — borders are the structure.
- **Shadow Strategy:** `shadow-sm` by default. No hover lift on cards in operational surfaces; cards are containers, not interactive objects.
- **Internal Padding:** 24px (`p-6`) for header, content, footer.
- **Title:** Title typography (1.25rem, 600). Description: body, Stone color.

### Badges (and the semantic palette)

- **Shape:** Rounded-md, 8px horizontal × 4px vertical padding.
- **Style:** Tinted background (50-shade), saturated foreground (700-shade), `inset-ring` of the same hue at 10% opacity. Each semantic color (gray, red, violet, green, yellow, blue, indigo, pink) gets its own variant.
- **State:** Static — badges report, they don't toggle. Use `Toggle` or `Chip` for filterable states.
- **Dark theme:** Background drops to 400/10, foreground lifts to 400, ring lifts to 400/20.

### Alerts

- **Shape:** Rounded-lg, 16px padding, 1px border in the variant's hue at 50% opacity.
- **Variants:** `default` (neutral), `information` (Cool Blue), `success` (Service Green), `warning` (Amber Caution), `destructive` (Pepper Red).
- **Anatomy:** Optional left-aligned 16px lucide icon at top-4/left-4, title at body weight 500 with tracking-tight, description at xs body.

### Sidebar

- **Style:** 16rem wide, Sidebar Vellum background, 1px right border. Collapses to 3rem icon-only rail; mobile uses a Sheet drawer at 18rem.
- **Items:** Inter label size (0.875rem), Stone foreground at rest, Ink on hover, Service Indigo on active with a Mist fill (`{colors.sidebar-accent}`).
- **Persistence:** Open/closed state stored in `sidebar_state` cookie for 7 days. Keyboard shortcut `cmd/ctrl + b`.

### Dialogs / Sheets

- **Shape:** Rounded-lg dialogs (sm:max-w-xl), rounded-xl sheets.
- **Background:** `bg-background` with 1px border and `shadow-lg`. Overlay is `bg-black/50` (no blur — see Don'ts).
- **Motion:** Fade + zoom (95% → 100%) on open, fade on close; 200ms duration. Sheets slide from edge with 300/500ms asymmetric duration.

### Status Indicators (signature pattern)

The product's defining UI moment: any menu item, location, or organization can be in one of `draft`, `pending`, `published`, or `archived`. These are surfaced as Badge variants with consistent color mapping site-wide:

- `draft` → neutral gray badge
- `pending` → amber badge
- `published` → green badge with leading dot
- `archived` → outline-only gray badge

This mapping is non-negotiable across the product — operators learn it in their first session.

## 6. Do's and Don'ts

### Do:

- **Do** use Service Indigo for the one primary action per screen. If you have two "primary" buttons in view, the design is wrong.
- **Do** use 1px `{colors.border}` borders to define every container edge. Borders are the structure of this system.
- **Do** map status (`draft`/`pending`/`published`/`archived`) to the same badge variants everywhere. Operators learn the mapping once.
- **Do** keep the focus ring at `ring-2 ring-ring ring-offset-2` on all interactive elements. Keyboard accessibility is part of the brand promise.
- **Do** respect `prefers-reduced-motion` — fall back to opacity-only transitions, no scale or slide.
- **Do** use semantic Alert variants (`destructive`, `warning`, `success`, `information`) for status messaging, never raw colored cards.
- **Do** use the `xs` button-group treatment with `shadow-xs` for inline toolbars in editor surfaces.
- **Do** keep body line length to 65–75ch in long-form (blog, docs, dialog descriptions).

### Don't:

- **Don't** ship a crypto-style neon dashboard. No saturated gradients on dark backgrounds, no glow accents, no animated borders on operational surfaces.
- **Don't** ship gamified flourishes — no achievement confetti on a Save, no streak counters, no playful empty-state mascots that don't help the operator do the next thing. (`canvas-confetti` is loaded but should be reserved for genuine first-time milestones, never routine actions.)
- **Don't** layer template-SaaS marketing decoration over admin screens — no rainbow-gradient hero metrics, no animated beam borders around dashboard cards.
- **Don't** use `border-left` greater than 1px as a colored stripe to flag status. Use the Badge palette or full borders.
- **Don't** use `background-clip: text` with gradients on titles. Solid colors only.
- **Don't** use glassmorphism (backdrop-blur on translucent panels) as a default style. The `glass` utility exists for one specific scroll-mask use case — not as a card treatment.
- **Don't** mix shadow vocabulary mid-surface. Cards use `shadow-sm`; popovers use `shadow-md`; dialogs use `shadow-lg`. Never stack them.
- **Don't** raise hover-elevation on cards in the operational app. Cards aren't buttons.
- **Don't** use `#000` or `#fff` directly. Reach for `{colors.foreground}` and `{colors.background}` — every neutral is OKLCH-resolved.
- **Don't** introduce a new accent hue for "delight" or "branding." If a screen needs more color, the answer is a Badge or Status indicator, not a new primary.
- **Don't** use em dashes in UI copy. Use commas, colons, semicolons, or parentheses.
- **Don't** wrap simple content in Cards by reflex. Most lists, tables, and form sections live directly on the page background separated by spacing and borders.
