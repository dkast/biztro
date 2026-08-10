---
target: sales closing dashboard
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
timestamp: 2026-08-10T04-53-24Z
slug: src-components-sales-sales-closing-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---:|---|
| 1 | Visibility of System Status | 3/4 | Daily totals and trends are visible, but `Cobrado` has several competing representations. |
| 2 | Match Between System and Real World | 3/4 | Payment methods and origins use restaurant language; `Abonos de cartera` is unexplained. |
| 3 | User Control and Freedom | 2/4 | The report is a fixed reading path; no direct way to move from a payment method to its reconciliation detail. |
| 4 | Consistency and Standards | 3/4 | Tables, badges, and empty states follow the system; section priority does not. |
| 5 | Error Prevention | 3/4 | Clear empty states, but no reconciliation cue highlights an unexpected collection mix. |
| 6 | Recognition Rather Than Recall | 3/4 | The method legend is visible, though users must compare it with a separate table to understand payment origin. |
| 7 | Flexibility and Efficiency | 2/4 | Frequent closers must scroll through an hourly chart before the detailed payment breakdown. |
| 8 | Aesthetic and Minimalist Design | 2/4 | The calm visual language holds, but duplicate totals and disconnected section blocks add avoidable density. |
| 9 | Error Recovery | 2/4 | Empty states help, but there is no explanation or path when a collection figure does not reconcile. |
| 10 | Help and Documentation | 2/4 | Credit and receivables terminology has no local explanation. |
| **Total** |  | **25/40** | **Functional, but the reporting hierarchy needs distillation.** |

## Design Specificity Verdict

The page belongs to Biztro: it uses restrained borders, operational typography, familiar accounting language, and compact data components rather than generic dashboard decoration. Its weakness is structural, not visual identity. The same collected-money fact is treated as a KPI, a section total, a donut-center total, and a table footer, so the layout has no single canonical moment for reconciliation.

The deterministic scan reports no findings for `src/components/sales/sales-closing.tsx` or `src/components/sales/sales-closing-collections-pie-chart.tsx`. That is expected: it detects mechanical UI patterns, not redundant semantic representations or misplaced decision hierarchy.

## Overall Impression

The closing dashboard has reliable components and good empty states, but its payment-reconciliation story is split apart. A closer should first learn whether the day reconciles, then inspect the method/origin breakdown, then use hourly sales as supporting context. The page currently gives the method chart, hourly chart, and payment table near-equal prominence while making the user re-read the same total.

## What's Working

- The summary grid makes daily performance immediately scannable; trend labels keep it tied to yesterday rather than presenting isolated numbers.
- The payment donut has a strong interaction model: a hovered method updates the center and the list preserves recognition instead of requiring slice-label lookup.
- Empty states are direct and operationally useful across collections, sales, and product modules.

## Priority Issues

### [P1] Cobros has four competing summaries

**What:** `Cobrado del día` appears in the summary KPI, the `Cobros del día` header total, the donut center, and the `Total cobrado` table footer. The method legend also duplicates per-method amounts shown in the table.

**Why it matters:** A closer cannot tell whether these are separate measures or repeated views of the same measure. This creates verification work rather than supporting it.

**Fix:** Make the summary KPI the report-level total. In the payment block, keep the donut center as the method-composition total and the table footer as the reconciling total. Remove the header total. Make the chart legend show method name and share only, reserving amount and payment count for the detail table. This creates clear overview -> composition -> reconciliation roles.

**Suggested command:** `$impeccable distill`

### [P1] The payment breakdown is separated from its overview

**What:** The payment chart is paired with `Ventas por hora`, then the table that explains payment method and origin comes after that unrelated chart.

**Why it matters:** Payment reconciliation is an operator’s likely next action. The current sequence makes users change mental context from collections to sales timing and back to collections.

**Fix:** Treat the donut and collection table as one `Cobros` module. At wide sizes, place the compact donut/legend beside `Ventas por hora`, but reveal the detailed table through a clear in-module `Desglose por método y origen` disclosure or place it immediately beneath the donut before the next major analytics group. Preserve DOM order: Cobros overview -> Cobros detail -> hourly sales.

**Suggested command:** `$impeccable layout`

### [P2] Equal-sized sections imply equal decision priority

**What:** `Cobros del día`, `Ventas por hora`, `Ventas por tipo de orden`, and `Productos más vendidos` use similar headings, spacing, and containers despite serving different jobs.

**Why it matters:** The page reads as a catalog of reports rather than a closing workflow. High-frequency reconciliation and explanatory analytics compete for attention.

**Fix:** Establish a clear sequence: daily result and reconciliation first; then diagnostic analytics (hourly sales, order channels, products); then recent-sale audit trail. Use spacing and section framing to make the transition visible instead of repeating the same grid rhythm.

**Suggested command:** `$impeccable layout`

### [P2] Credit terminology appears without explanation

**What:** `Crédito generado` and `Abonos de cartera` can appear conditionally in the summary but have no context explaining their relationship to the cash collected total.

**Why it matters:** New operators can misread credit generation as money received, precisely when they are trying to reconcile the day.

**Fix:** Add concise contextual help at the summary-to-collections boundary, such as a compact definition or a relation label that makes clear that a cartera abono is money received after the original sale.

**Suggested command:** `$impeccable clarify`

## Persona Red Flags

**Mariana, shift manager closing the register:** She sees the same collected total in four places, then must scroll past hourly performance to reach the only breakdown with payment count and origin. The page fails to establish which number is the reconciliation authority.

**Luis, multi-location operator reviewing the day:** The method legend gives amount and share, while the table repeats amount plus origin and payment count. He has to compare two views manually to understand whether card or transfer activity needs attention.

**Sofía, first-time restaurant owner:** Conditional terms such as `Crédito generado` and `Abonos de cartera` arrive alongside familiar sales metrics without explanation. She risks equating credit extension with money collected.

## Minor Observations

- Count badges are inconsistent: order type, top products, and recent sales signal record counts, while payment detail does not clarify its row scope.
- The wide minimum table widths are acceptable with horizontal scrolling, but the detail table should not be the only path to payment counts on mobile.
- The static donut avoids loading flicker, but its hover-only method focus does not translate to keyboard interaction.

## Questions to Consider

- Is this screen primarily for closing a cash drawer, reviewing management performance, or both? One page can support both, but only one should lead.
- Should the table be immediately visible for reconciliation, or should it become an on-demand audit detail once the compact method summary answers the first question?
- Could `Cobrado del día` remain a KPI while the collection module be renamed `Métodos de cobro` to eliminate the sense of duplicate totals?
