---
name: Biztro
description: Calm, precise digital menu operations for hospitality teams.
colors:
  background: "oklch(1 0 0)"
  foreground: "oklch(0.145 0 0)"
  card: "oklch(1 0 0)"
  card-foreground: "oklch(0.145 0 0)"
  primary: "oklch(68.5% 0.169 237.323)"
  primary-foreground: "oklch(0.969 0.016 293.756)"
  secondary: "oklch(0.97 0 0)"
  secondary-foreground: "oklch(0.205 0 0)"
  muted: "oklch(0.97 0 0)"
  muted-foreground: "oklch(0.556 0 0)"
  destructive: "oklch(0.577 0.245 27.325)"
  destructive-foreground: "oklch(0.985 0 0)"
  border: "oklch(0.922 0 0)"
  input: "oklch(0.922 0 0)"
  ring: "oklch(82.8% 0.111 230.318)"
  sidebar: "oklch(0.985 0.002 247.839)"
  sidebar-foreground: "oklch(43.9% 0 0)"
  sidebar-accent: "oklch(0.922 0 0)"
  sidebar-accent-foreground: "oklch(0.205 0 0)"
  info: "var(--color-blue-500)"
  success: "var(--color-emerald-500)"
  warning: "var(--color-amber-500)"
  dark-background: "oklch(0.145 0 0)"
  dark-card: "oklch(0.205 0 0)"
typography:
  display:
    fontFamily: "var(--font-be-vietnam-pro), ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 500
    lineHeight: 1.111
    letterSpacing: "-0.025em"
    fontVariation: "'wdth' 112.5"
  headline:
    fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.333
    letterSpacing: "-0.025em"
  title:
    fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "normal"
  body:
    fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.429
    letterSpacing: "normal"
  label:
    fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.333
    letterSpacing: "normal"
rounded:
  xs: "calc(0.65rem - 6px)"
  sm: "calc(0.65rem - 4px)"
  md: "calc(0.65rem - 2px)"
  lg: "0.65rem"
  xl: "calc(0.65rem + 4px)"
  2xl: "1rem"
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
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "0.5rem 1rem"
    height: "2.5rem"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "0.5rem 1rem"
    height: "2.5rem"
  input-default:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
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
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0.25rem 0.5rem"
  sidebar-default:
    backgroundColor: "{colors.sidebar}"
    textColor: "{colors.sidebar-foreground}"
    width: "16rem"
---

# Design System: Biztro

## Overview

**Creative North Star: "The Mise en Place"**

Biztro is the digital counterpart to a kitchen's mise en place: every menu item, locale, price, and publishing state has a clear place and is ready when service begins. The interface earns trust through calm density, explicit hierarchy, and familiar controls. It should feel fast without feeling rushed.

The visual system is restrained but not anonymous. Clean neutral planes and fine structural lines keep long editing sessions legible, while a clear sky blue identifies commitment, selection, and focus. Warmth comes from the Be Vietnam Pro display face, measured spacing, and hospitality-specific content rather than decoration.

The system supports light and dark themes as equal operating modes. Color, elevation, and motion communicate state; they do not compete with the work.

**Key Characteristics:**

- Flat neutral surfaces with fine borders and sparing shadows
- A clear sky-blue action color used with discipline
- Semantic color reserved for status and feedback
- Be Vietnam Pro for expressive moments, Inter for operational UI
- Compact mobile-first layouts that open into stable desktop workspaces
- Explicit focus, validation, loading, and destructive states

## Colors

The palette is a cool near-monochrome field with a single clear sky-blue action color and conventional semantic colors for feedback.

### Primary

- **Service Sky**: The product's active voice. Use it for primary actions, selection outlines, active controls, and progress that requires attention.
- **Service Sky Foreground**: A softly tinted near-white used on Service Sky fills.
- **Focus Mist**: The lighter ring color that keeps keyboard focus visible without turning it into a glow effect.

### Neutral

- **Paper**: The light-theme page, input, and card plane.
- **Ink**: Primary text and the dark-theme page plane.
- **Prep Surface**: The quiet secondary and hover fill used to group related controls.
- **Stone Copy**: Supporting text, descriptions, placeholders, and low-priority metadata.
- **Hairline**: The shared border and input stroke that separates surfaces without heavy framing.
- **Cool Vellum**: The faintly blue-gray sidebar plane that distinguishes navigation from work content.
- **Charcoal Surface**: The dark-theme raised surface for cards, popovers, and dialogs.

### Tertiary

- **Pepper Red**: Destructive actions, errors, and blocking states.
- **Service Green**: Successful, available, or healthy states.
- **Amber Caution**: Warnings, pending states, and decisions that need review.
- **Information Blue**: Explanatory and synchronization messages that do not require destructive urgency.

### Named Rules

**The One Action Color Rule.** Service Sky identifies commitment and active state; do not spread it across passive decoration.

**The Semantic Color Rule.** Green, amber, red, violet, pink, and secondary blues communicate meaning; they are not alternate brand themes.

## Typography

**Display Font:** Be Vietnam Pro (with ui-sans-serif and system fallbacks)

**Body Font:** Inter (with ui-sans-serif and system fallbacks)

**Character:** Be Vietnam Pro adds a warm, contemporary hospitality voice to high-level moments. Inter stays neutral and highly legible across dense forms, tables, navigation, and status text.

### Hierarchy

- **Display** (500, 2.25rem, 1.111): Authentication, content, and high-emphasis onboarding headings. Use the width variation only with this family.
- **Headline** (600, 1.5rem, 1.333): Responsive page titles and major section entry points.
- **Title** (600, 1rem, 1.25): Panel headings, grouped settings, card titles, and dialog hierarchy.
- **Body** (400, 0.875rem, 1.429): Default product copy, form content, table rows, and descriptions.
- **Label** (500, 0.75rem, 1.333): Badges, compact metadata, field labels, and dense navigation annotations.

### Named Rules

**The Operational Body Rule.** Inter owns controls and repeated reading; Be Vietnam Pro appears only where a page needs a distinct voice.

**The Weight Before Color Rule.** Build hierarchy with size and 500/600 weights before introducing another text color.

## Layout

The application is mobile-first and edge-efficient. Page shells use 1rem horizontal padding on compact screens, 1.5rem from the small breakpoint, and 2rem on wider desktop headers. Task pages generally cap themselves between 42rem and 80rem, while dense editor surfaces can extend to 72rem and split into a flexible main column with an 18rem context rail.

The desktop workspace pairs a 16rem collapsible sidebar with a flexible content plane. It contracts to a 3rem icon rail and becomes an 18rem sheet on mobile. Headers stay 4rem high; page titles, actions, and descriptions stack on compact widths and align horizontally when room permits.

Spacing follows a 4px base rhythm. Use 8px for tightly related control anatomy, 16px for ordinary grouping, 24px for section separation and card padding, and 32px only between major regions. Prefer direct page sections separated by space or a hairline over nesting every group in a card.

### Named Rules

**The Stable Workspace Rule.** Desktop navigation may collapse, but the main work column must remain flexible and free of horizontal overflow.

**The Mobile Stack Rule.** Actions stack before labels truncate; preserve readable state and full-width primary actions on compact screens.

## Elevation & Depth

Biztro is flat by default. Background shifts, inset rings, and 1px borders establish most hierarchy. Shadows are reserved for controls with a slight physical shelf and surfaces that genuinely leave the document plane.

### Shadow Vocabulary

- **Whisper** (`0 1px 2px 0 rgb(0 0 0 / 0.05)`): Inputs, compact controls, and restrained editor toolbars.
- **Resting Surface** (`0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)`): Cards and floating sidebar variants.
- **Overlay** (`0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`): Dropdowns, popovers, hover cards, and tooltips.
- **Modal** (`0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`): Dialogs, sheets, and command surfaces.

### Named Rules

**The Border Before Shadow Rule.** Use a neutral stroke to define a resting surface; add shadow only when its depth reflects behavior or stacking.

**The No Decorative Glow Rule.** Colored halos and ambient glows do not belong on operational surfaces; focus rings are the only colored emission.

## Shapes

The form language is softly squared. The shared 0.65rem radius anchors cards and default buttons; controls step down by 2px or 4px as they become smaller. Large onboarding and editor groups may use a 1rem radius, while pills are reserved for intrinsically compact or binary shapes.

Borders stay fine and neutral. Dashed borders indicate an empty drop zone or an optional creation area, not ordinary grouping. Circular geometry is reserved for avatars, status dots, and icon-only controls. Customer-facing menu heading shapes are an editor capability, not the operational application's default shape language.

### Named Rules

**The Nested Radius Rule.** Inner controls use a smaller radius than the surface that contains them.

**The Pill With Purpose Rule.** Use full rounding for avatars, compact toggles, and true chips; default buttons and fields remain softly squared.

## Components

### Buttons

- **Character:** Compact, confident, and immediately legible.
- **Primary:** Service Sky fill with the tinted near-white foreground, a subtle inset highlight, 40px default height, and 16px horizontal padding.
- **Outline:** Paper fill with an input-tone inset ring; use for equal-but-secondary choices and safe cancellation.
- **Ghost / Link:** Ghost buttons reveal a Prep Surface on hover. Links use Service Sky and gain an underline on hover.
- **Destructive:** Pepper Red fill with a light foreground; reserve it for confirmed irreversible actions.
- **States:** Focus uses a visible ring and offset. Disabled controls retain their geometry at half opacity. Pressing scales to 98% without changing layout.
- **Sizes:** 32px extra-small, 36px small, 40px default, and 44px large, with matching square icon variants.

### Inputs / Fields

- **Style:** Transparent Paper surface, Hairline border, 36px height, 12px horizontal padding, and a Whisper shadow.
- **Focus:** Shift the stroke to Focus Mist and add a 3px translucent ring.
- **Invalid:** Use the destructive stroke and a restrained destructive ring; never fill the entire field red.
- **Dark theme:** Introduce a faint input fill so the field remains distinct from the dark page.

### Cards / Containers

- **Style:** Card plane, shared large radius, subtle inset edge, and a very restrained resting shadow.
- **Padding:** 24px for standard header, content, and footer regions; compact sidebar cards may reduce this to 12px.
- **Behavior:** Cards are structural by default. Do not add hover lift unless the entire card is an explicit interactive target.

### Badges

- **Style:** 8px horizontal and 4px vertical padding, compact label type, softly squared corners, tinted background, saturated text, and a half-pixel inset ring.
- **Variants:** Neutral, destructive, outline, violet, green, yellow, blue, indigo, and pink.
- **Behavior:** Badges report state. Use toggles or buttons when the user can change the state directly.

### Alerts

- **Style:** 16px padding, shared large radius, a semantic 50% border, and an optional 16px leading icon.
- **Variants:** Neutral, destructive, information, success, and warning.
- **Hierarchy:** Medium title, compact description, and no decorative illustration competing with the message.

### Navigation

- **Style:** 16rem Cool Vellum sidebar with 32px menu rows, 8px internal padding, 4px row gaps, and compact Inter labels.
- **Active / Hover:** Use the sidebar accent plane and stronger text. Active state adds weight, not a competing color block.
- **Responsive:** Collapse to a 3rem icon rail on desktop or move into an 18rem sheet on mobile. Preserve tooltips for collapsed icon items.

### Dialogs / Sheets

- **Style:** Background plane, Hairline border, 24px padding, shared large radius, and Modal shadow.
- **Motion:** Dialogs fade and scale from 95% over 200ms. Sheets slide from their edge; drawers replace bottom sheets on compact task flows where touch dismissal is expected.
- **Actions:** Stack in reverse order on mobile so the primary action remains visually last, then align to the end on larger screens.

## Do's and Don'ts

### Do:

- **Do** use Service Sky for the primary action or active state, not for passive decoration.
- **Do** use fine borders and neutral surface changes before reaching for shadows.
- **Do** keep desktop task content within an intentional max-width while allowing editor surfaces to use the available workspace.
- **Do** stack page actions and dialog actions on mobile before truncating important labels.
- **Do** use the existing semantic badge and alert variants for status.
- **Do** preserve visible focus rings and descriptive labels on every interactive path.
- **Do** respect reduced-motion preferences whenever adding or extending motion.
- **Do** use TextMorph only for saving and loading transitions.

### Don't:

- **Don't** use neon dashboards, glow effects, or saturated gradients as an operational background.
- **Don't** turn routine saves or edits into gamified celebrations.
- **Don't** wrap every section in a card; spacing and separators are often enough.
- **Don't** raise resting cards on hover unless the entire surface is interactive.
- **Don't** use semantic colors as decorative alternate themes.
- **Don't** use backdrop blur as a default card treatment.
- **Don't** use display typography for dense forms, tables, or navigation.
- **Don't** introduce a new radius, shadow, or spacing step when an existing token fits.
- **Don't** use em dashes in user-facing interface copy.
