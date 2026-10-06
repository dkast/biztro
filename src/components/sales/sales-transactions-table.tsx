import { ReceiptText } from "lucide-react"
import Link from "next/link"

import { SalesTransactionRow } from "@/components/sales/sales-transaction-row"
import { SalesTransactionsPagination } from "@/components/sales/sales-transactions-controls"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import type { SalesTransactionsPage } from "@/lib/types/sales"

export function SalesTransactionsTable({
  data,
  hasActiveFilters
}: {
  data: SalesTransactionsPage
  hasActiveFilters: boolean
}) {
  if (data.transactions.length === 0) {
    return (
      <Empty className="min-h-64 border-0 py-12">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ReceiptText aria-hidden />
          </EmptyMedia>
          <EmptyTitle>
            {hasActiveFilters
              ? "No hay transacciones con estos filtros"
              : "No hay transacciones recientes"}
          </EmptyTitle>
          <EmptyDescription>
            {hasActiveFilters
              ? "Prueba otros criterios o restablece los filtros."
              : "Cuando registres ventas, aparecerán aquí ordenadas por fecha."}
          </EmptyDescription>
        </EmptyHeader>
        {hasActiveFilters && (
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/sales/transactions" prefetch={false}>
              Restablecer filtros
            </Link>
          </Button>
        )}
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="hidden md:table-cell">Tipo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden lg:table-cell">
                Métodos de pago
              </TableHead>
              <TableHead className="hidden text-right sm:table-cell">
                Artículos
              </TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-8">
                <span className="sr-only">Ver detalle</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.transactions.map(transaction => (
              <SalesTransactionRow
                key={transaction.id}
                transaction={transaction}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <SalesTransactionsPagination
        page={data.page}
        totalCount={data.totalCount}
        pageSize={data.pageSize}
      />
    </div>
  )
}
