"use client"

import { Search, UserRound, WalletCards } from "lucide-react"
import Link from "next/link"
import { parseAsString, useQueryState } from "nuqs"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { formatPrice } from "@/lib/currency"
import type { ReceivableCustomer } from "@/lib/types/customers"

const receivablesSearchQuery = parseAsString
  .withDefault("")
  .withOptions({ shallow: false, scroll: false })

export function ReceivablesList({
  customers
}: {
  customers: ReceivableCustomer[]
}) {
  const [search, setSearch] = useQueryState("q", receivablesSearchQuery)
  const query = search.trim().toLocaleLowerCase("es")
  const filteredCustomers = customers.filter(customer =>
    [customer.name, customer.phone ?? "", customer.email ?? ""].some(value =>
      value.toLocaleLowerCase("es").includes(query)
    )
  )

  if (customers.length === 0) {
    return (
      <Empty className="border-border min-h-80 rounded-lg border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <WalletCards />
          </EmptyMedia>
          <EmptyTitle>No hay saldos pendientes</EmptyTitle>
          <EmptyDescription>
            Las ventas a crédito aparecerán aquí cuando tengan saldo.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="relative max-w-md">
        <Search
          aria-hidden
          className="text-muted-foreground absolute top-1/2 left-3 size-4
            -translate-y-1/2"
        />
        <Input
          value={search}
          onChange={event => void setSearch(event.target.value)}
          className="pl-9"
          placeholder="Buscar cliente"
        />
      </div>
      <div className="border-border overflow-x-auto rounded-lg border">
        <Table className="min-w-[42rem]">
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Saldo pendiente</TableHead>
              <TableHead>Ventas abiertas</TableHead>
              <TableHead>Último movimiento</TableHead>
              <TableHead>
                <span className="sr-only">Ver detalle</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map(customer => (
              <TableRow key={customer.id}>
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{customer.name}</span>
                    {customer.phone && (
                      <span className="text-muted-foreground text-xs">
                        {customer.phone}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {customer.summaries.map(summary => (
                      <span
                        key={summary.currency}
                        className="font-medium tabular-nums"
                      >
                        {formatPrice(
                          summary.balanceMinor / 100,
                          summary.currency
                        )}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {customer.summaries.map(summary => (
                      <Badge key={summary.currency} variant="secondary">
                        {summary.openSales}{" "}
                        {summary.openSales === 1 ? "venta" : "ventas"} ·{" "}
                        {summary.currency}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Intl.DateTimeFormat("es-MX", {
                    dateStyle: "medium"
                  }).format(new Date(customer.lastMovementAt))}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/sales/receivables/${customer.id}`}>
                      <UserRound data-icon="inline-start" />
                      Ver detalle
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {filteredCustomers.length === 0 && (
        <p className="text-muted-foreground text-sm">
          No hay clientes que coincidan con la búsqueda.
        </p>
      )}
    </div>
  )
}
