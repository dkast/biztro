"use client"

import {
  createContext,
  useContext,
  useState,
  useTransition,
  type ReactNode
} from "react"
import toast from "react-hot-toast"
import { Download, LoaderCircle, SearchIcon, XIcon } from "lucide-react"
import { useQueryStates } from "nuqs"

import { SalesTransactionsDateRangeFilter } from "@/components/sales/sales-transactions-date-range-filter"
import {
  SalesTransactionsFacetFilter,
  type SalesTransactionsFacetOption
} from "@/components/sales/sales-transactions-facet-filter"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from "@/components/ui/input-group"
import {
  defaultSalesTransactionFilters,
  getSalesTransactionExportFilename,
  type SalesTransactionQueryState
} from "@/lib/sales-transactions"
import { salesTransactionsQueryParsers } from "@/lib/sales-transactions-query-parsers"
import {
  paymentMethodLabels,
  paymentMethodValues,
  paymentStatusLabels,
  paymentStatusValues
} from "@/lib/types/payments"
import {
  salesOrderTypeLabels,
  salesOrderTypeValues,
  saleStatusLabels,
  saleStatusValues
} from "@/lib/types/sales"

type SalesTransactionsControlsValue = {
  filters: SalesTransactionQueryState
  isPending: boolean
  updateFilters: (updates: Partial<SalesTransactionQueryState>) => void
  resetFilters: () => void
}

const SalesTransactionsControlsContext =
  createContext<SalesTransactionsControlsValue | null>(null)

export function SalesTransactionsControlsProvider({
  children
}: {
  children: ReactNode
}) {
  const [filters, setFilters] = useQueryStates(salesTransactionsQueryParsers, {
    shallow: false,
    scroll: false
  })
  const [isPending, startTransition] = useTransition()

  const updateFilters = (updates: Partial<SalesTransactionQueryState>) => {
    startTransition(() => {
      void setFilters({
        ...updates,
        page: updates.page ?? 1
      })
    })
  }

  const resetFilters = () => {
    startTransition(() => {
      void setFilters({ ...defaultSalesTransactionFilters })
    })
  }

  return (
    <SalesTransactionsControlsContext.Provider
      value={{ filters, isPending, updateFilters, resetFilters }}
    >
      {children}
    </SalesTransactionsControlsContext.Provider>
  )
}

function useSalesTransactionsControls() {
  const context = useContext(SalesTransactionsControlsContext)
  if (!context) {
    throw new Error(
      "Sales transaction controls must be inside their context provider"
    )
  }
  return context
}

const statusOptions = saleStatusValues.map(status => ({
  value: status,
  label: saleStatusLabels[status]
}))

const orderTypeOptions = salesOrderTypeValues.map(orderType => ({
  value: orderType,
  label: salesOrderTypeLabels[orderType]
}))

const paymentStatusOptions = paymentStatusValues.map(status => ({
  value: status,
  label: paymentStatusLabels[status]
}))

const paymentMethodOptions: SalesTransactionsFacetOption<
  Exclude<SalesTransactionQueryState["paymentMethod"], "all">
>[] = [
  ...paymentMethodValues.map(method => ({
    value: method,
    label: paymentMethodLabels[method]
  })),
  { value: "LEGACY", label: "Pago histórico" }
]

function hasActiveFilters(filters: SalesTransactionQueryState) {
  return (
    filters.range !== defaultSalesTransactionFilters.range ||
    filters.status !== "all" ||
    filters.orderType !== "all" ||
    filters.paymentStatus !== "all" ||
    filters.paymentMethod !== "all" ||
    filters.q.trim().length > 0
  )
}

export function SalesTransactionsFilterBar({
  validationError
}: {
  validationError?: string
}) {
  const { filters, isPending, updateFilters, resetFilters } =
    useSalesTransactionsControls()

  return (
    <div aria-busy={isPending} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <InputGroup className="h-8 w-full sm:w-64">
          <InputGroupAddon>
            <SearchIcon aria-hidden />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            maxLength={100}
            aria-label="Buscar por cliente"
            placeholder="Buscar cliente"
            value={filters.q}
            onChange={event => updateFilters({ q: event.currentTarget.value })}
          />
        </InputGroup>
        <SalesTransactionsDateRangeFilter
          value={filters}
          isInvalid={Boolean(validationError)}
          onChange={updateFilters}
        />
        <SalesTransactionsFacetFilter
          title="Estado"
          value={filters.status}
          options={statusOptions}
          onChange={status => updateFilters({ status })}
        />
        <SalesTransactionsFacetFilter
          title="Tipo de orden"
          value={filters.orderType}
          options={orderTypeOptions}
          onChange={orderType => updateFilters({ orderType })}
        />
        <SalesTransactionsFacetFilter
          title="Pago"
          value={filters.paymentStatus}
          options={paymentStatusOptions}
          onChange={paymentStatus => updateFilters({ paymentStatus })}
        />
        <SalesTransactionsFacetFilter
          title="Método"
          value={filters.paymentMethod}
          options={paymentMethodOptions}
          onChange={paymentMethod => updateFilters({ paymentMethod })}
        />
        {(hasActiveFilters(filters) || validationError) && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8"
            onClick={resetFilters}
          >
            Restablecer
            <XIcon data-icon="inline-end" />
          </Button>
        )}
        {isPending && (
          <LoaderCircle
            aria-label="Actualizando resultados"
            className="text-muted-foreground size-4 animate-spin"
          />
        )}
      </div>

      {validationError && (
        <Alert variant="destructive">
          <AlertTitle>Revisa los filtros</AlertTitle>
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

function buildExportSearchParams(filters: SalesTransactionQueryState) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    const isDefaultEnumFilter =
      (key === "status" ||
        key === "orderType" ||
        key === "paymentStatus" ||
        key === "paymentMethod") &&
      value === "all"

    if (key !== "page" && value !== "" && !isDefaultEnumFilter) {
      params.set(key, String(value))
    }
  }
  return params
}

function getDownloadFilename(response: Response) {
  const contentDisposition = response.headers.get("content-disposition")
  const filename = contentDisposition?.match(/filename="([^"]+)"/)?.[1]
  return filename || getSalesTransactionExportFilename()
}

export function SalesTransactionsExportButton({
  hasTransactions
}: {
  hasTransactions: boolean
}) {
  const { filters, isPending } = useSalesTransactionsControls()
  const [isDownloading, setIsDownloading] = useState(false)

  const exportTransactions = async () => {
    if (isPending || isDownloading || !hasTransactions) return

    setIsDownloading(true)
    try {
      const params = buildExportSearchParams(filters)
      const response = await fetch(
        `/api/sales/transactions/export?${params.toString()}`,
        { cache: "no-store" }
      )

      if (!response.ok) {
        const result: { error?: string } = await response.json()
        throw new Error(result.error || "No se pudo exportar el archivo CSV.")
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = getDownloadFilename(response)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 0)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo exportar el archivo CSV."
      )
    } finally {
      setIsDownloading(false)
    }
  }

  const isDisabled = isPending || isDownloading || !hasTransactions

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full sm:w-auto"
      disabled={isDisabled}
      aria-live="polite"
      onClick={exportTransactions}
    >
      {isDownloading ? (
        <LoaderCircle data-icon="inline-start" className="animate-spin" />
      ) : (
        <Download data-icon="inline-start" />
      )}
      {isDownloading ? "Exportando…" : "Exportar CSV"}
    </Button>
  )
}

export function SalesTransactionsPagination({
  page,
  totalCount,
  pageSize
}: {
  page: number
  totalCount: number
  pageSize: number
}) {
  const { isPending, updateFilters } = useSalesTransactionsControls()
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize))
  const firstResult = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const lastResult = Math.min(page * pageSize, totalCount)

  return (
    <div
      className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center"
    >
      <p className="text-muted-foreground flex-1 text-sm" aria-live="polite">
        {totalCount === 0
          ? "0 transacciones"
          : `${firstResult}–${lastResult} de ${totalCount.toLocaleString("es-MX")} transacciones`}
      </p>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <p className="text-muted-foreground text-sm tabular-nums">
          Página {page} de {pageCount}
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending || page <= 1}
            onClick={() => updateFilters({ page: page - 1 })}
          >
            Anterior
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending || page >= pageCount}
            onClick={() => updateFilters({ page: page + 1 })}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}
