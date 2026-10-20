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
Views refresh every 5 seconds while visible and on focus or reconnection.
Actions are disabled when the snapshot is offline or older than 20 seconds.

## Deployment

Apply the additive migration `20261020000000_add_kitchen_orders` before
deploying the application:

```bash
bun run prisma:migrate
```

It creates `Order` and `OrderItem` and adds `Organization.paymentTiming` with
a `PAY_FIRST` default. Existing sales are not backfilled, so the kitchen starts
empty after deployment.
