"use client"

import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { TableCell, TableRow } from "@/components/ui/table"
import { formatPrice } from "@/lib/currency"
import { salesTransactionsTimeZone } from "@/lib/sales-transactions"
import { paymentMethodLabels, paymentStatusLabels } from "@/lib/types/payments"
import {
  salesOrderTypeLabels,
  saleStatusLabels,
  type SalesTransaction
} from "@/lib/types/sales"
import { cn } from "@/lib/utils"

const transactionDateFormatter = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: salesTransactionsTimeZone
})

const transactionTimeFormatter = new Intl.DateTimeFormat("es-MX", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: salesTransactionsTimeZone
})

const statusDotClassNames = {
  PAID: "bg-success",
  PARTIAL: "bg-warning",
  PENDING: "bg-info",
  VOID: "bg-destructive"
} as const

function TransactionStatus({ transaction }: { transaction: SalesTransaction }) {
  const isVoid = transaction.status === "VOID"
  const key = isVoid ? "VOID" : transaction.paymentStatus
  const label = isVoid
    ? saleStatusLabels.VOID
    : paymentStatusLabels[transaction.paymentStatus]

  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span
        aria-hidden
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          statusDotClassNames[key]
        )}
      />
      {label}
    </span>
  )
}

function getPaymentMethodsLabel(transaction: SalesTransaction) {
  return transaction.paymentMethods
    .map(method => {
      const label =
        method === "LEGACY" ? "Pago histórico" : paymentMethodLabels[method]
      return transaction.voidedPaymentMethods.includes(method)
        ? `${label} (anulado)`
        : label
    })
    .join(", ")
}

export function SalesTransactionRow({
  transaction
}: {
  transaction: SalesTransaction
}) {
  const router = useRouter()
  const createdAt = new Date(transaction.createdAt)
  const customerName = transaction.customerName ?? "Sin cliente"
  const paymentMethods = getPaymentMethodsLabel(transaction)
  const isVoid = transaction.status === "VOID"

  const saleHref = `/dashboard/sales/order/${transaction.id}`

  return (
    <TableRow
      className="group cursor-pointer"
      onClick={event => {
        if (event.target instanceof Element && event.target.closest("a")) {
          return
        }
        router.push(saleHref, { scroll: false })
      }}
    >
      <TableCell className="py-3 whitespace-nowrap">
        <div className="flex flex-col">
          <span className="font-medium tabular-nums">
            {transactionDateFormatter.format(createdAt)}
          </span>
          <span className="text-muted-foreground text-xs tabular-nums">
            {transactionTimeFormatter.format(createdAt)}
          </span>
        </div>
      </TableCell>
      <TableCell
        className={cn(
          "max-w-56 truncate py-3",
          !transaction.customerName && "text-muted-foreground"
        )}
        title={customerName}
      >
        {customerName}
      </TableCell>
      <TableCell
        className="text-muted-foreground hidden py-3 whitespace-nowrap
          md:table-cell"
      >
        {salesOrderTypeLabels[transaction.orderType]}
      </TableCell>
      <TableCell className="py-3">
        <TransactionStatus transaction={transaction} />
      </TableCell>
      <TableCell
        className="text-muted-foreground hidden max-w-52 truncate py-3
          lg:table-cell"
        title={paymentMethods || undefined}
      >
        {paymentMethods || "Sin pagos"}
      </TableCell>
      <TableCell className="hidden py-3 text-right tabular-nums sm:table-cell">
        {transaction.items.toLocaleString("es-MX")}
      </TableCell>
      <TableCell className="py-3 text-right whitespace-nowrap tabular-nums">
        <span
          className={cn(
            "font-medium",
            isVoid && "text-muted-foreground line-through"
          )}
        >
          {formatPrice(transaction.total, transaction.currency)}
        </span>
        <span className="text-muted-foreground ml-1 text-xs">
          {transaction.currency}
        </span>
      </TableCell>
      <TableCell className="w-8 py-3 pr-3 text-right">
        <Link
          href={saleHref}
          scroll={false}
          prefetch={false}
          aria-label={`Ver detalle de venta de ${customerName}, ${transactionDateFormatter.format(createdAt)} ${transactionTimeFormatter.format(createdAt)}`}
          className="focus-visible:ring-ring inline-flex rounded-sm
            focus-visible:ring-2 focus-visible:outline-none"
        >
          <ChevronRight
            aria-hidden
            className="text-muted-foreground group-hover:text-foreground size-4
              transition-colors"
          />
        </Link>
      </TableCell>
    </TableRow>
  )
}
