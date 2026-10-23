# Kitchen display and payment timing

Biztro sends every new POS order to a shared kitchen queue at
`/dashboard/sales/kitchen`. Cashiers can collect pay-later orders from
`/dashboard/sales/pending` (**Por cobrar**).

## Payment timing

Owners choose when orders are charged in **Configuración > Pagos > Momento del
cobro**:

- **Cobrar al ordenar** (default): the POS completes a sale, then sends it to the
  kitchen. Credit sales follow the existing customer and Cartera rules.
- **Cobrar al entregar**: **Enviar a cocina** creates an unpaid order with no
  Sale, Payment, or receivable. **Por cobrar** creates the sale from the stored
  item and price snapshot when the cashier collects payment.

Changing this setting affects new orders only. Pending orders remain collectible
after switching back to pay-first.

## Order lifecycle

- Sent orders are locked. To change an unpaid order, cancel it with a reason and
  create a new one. The kitchen shows a cancellation notice until staff tap
  **Entendido**.
- Preparation is independent from payment: **Nueva > Preparando > Lista**.
  Ready orders leave the active board but remain in **Listas**, where staff can
  restore them to preparation.
- Voiding a sale from Transacciones also cancels its kitchen order.
- POS submissions carry a request ID, so retrying after a lost response does not
  duplicate tickets, sales, or payments.

## Kitchen board

The board uses a two-row grid sized by available width: 5×2 on wide screens,
3×2 or 2×2 on tablets, and one column on phones. Additional orders are paged.
Both Cocina and Por cobrar use Upstash Realtime notifications rather than
periodic database polling. An organization-scoped event triggers a batched
Server Component refresh after an order or payment-setting change. Changes
received during a refresh are reconciled in a follow-up refresh.

Initial connection, reconnection, foreground/focus, and manual retry fetch an
authoritative snapshot to recover missed changes. Hidden/offline screens pause
their subscription. A local timer updates elapsed labels without fetching data.
A connected queue can remain idle indefinitely without becoming stale just
because no orders changed. Actions are disabled while disconnected or awaiting
connection recovery; failed/slow reconciliation preserves the last snapshot and
shows its age with a retry control.

Notifications are published only after database commit and cache invalidation.
Publishing has a short timeout and one retry. Exhausted delivery failures are
reported to Sentry but do not undo a saved order or payment. There is no durable
outbox: another screen can miss a notification until reconnect, focus, or manual
retry. Retrying a notification can deliver duplicates; these are harmless
invalidation signals, not instructions to create orders or payments.

## Deployment

Apply the additive migration `20261020000000_add_kitchen_orders` before
deploying the application:

```bash
bun run prisma:migrate
```

It creates `Order` and `OrderItem` and adds `Organization.paymentTiming` with
a `PAY_FIRST` default. Existing sales are not backfilled, so the kitchen starts
empty after deployment.

Configure these **server-only** variables in the ignored local `.env` and in
every deployed environment before deploying:

```dotenv
UPSTASH_REDIS_REST_URL=<your Redis REST URL>
UPSTASH_REDIS_REST_TOKEN=<your Redis REST token>
```

`src/env.mjs` requires a valid URL and a nonempty token. Never prefix either
variable with `NEXT_PUBLIC_`, commit their values, or send them to the browser.
Rotate credentials shared outside your secrets manager before production use.

`/api/realtime` authenticates the session and active membership before opening
a stream and rejects every channel except that organization's order channel.
The stream is private and uncached. Redis history retains at most 256 events
per organization and expires after an hour without publication; reconnect
snapshot refreshes do not depend on this history still existing.

The SSE route and SDK are configured for a 300-second function lifetime. The
SDK reconnects shortly before that deadline. Deployment must support a
300-second streaming function (for example, Vercel with Fluid Compute enabled);
adjust **both** `maxDuration` in the route and `maxDurationSecs` in the server
Realtime configuration together if your platform has a lower limit.

Push removes the old five-second database reads, not all infrastructure cost:
SSE keeps a Next.js streaming function open, Redis carries notifications and
keepalives, and reconnect recovery fetches one snapshot. No background daemon,
cron job, or additional database migration is required.

For an opt-in delivery/replay integration check, use the repository-supported
Node 24 runtime and run:

```bash
RUN_UPSTASH_INTEGRATION=1 bunx vitest run src/server/orders/__tests__/realtime-integration.test.ts
```

This uses the local Redis credentials with a unique synthetic organization
channel, mocks authentication (no real dashboard session or orders), and removes
the temporary Redis key afterward. Normal test runs skip this network check.
