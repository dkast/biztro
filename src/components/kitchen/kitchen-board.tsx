"use client"

import { useLayoutEffect, useRef, useState } from "react"
import toast from "react-hot-toast"
import * as Sentry from "@sentry/nextjs"
import {
  ChefHat,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CookingPot,
  Flame,
  OctagonX,
  RotateCcw
} from "lucide-react"
import { useAction, useOptimisticAction } from "next-safe-action/hooks"
import { parseAsInteger, parseAsStringLiteral, useQueryStates } from "nuqs"

import { KitchenTicket } from "@/components/kitchen/kitchen-ticket"
import { LiveStatus } from "@/components/orders/live-status"
import { useLiveRefresh } from "@/components/orders/use-live-refresh"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  acknowledgeOrderCancellation,
  advanceKitchenOrder,
  restoreKitchenOrder
} from "@/server/actions/orders/mutations"
import {
  formatOrderNumber,
  getKitchenBoardColumns,
  getKitchenPageSize,
  getNextKitchenStatus,
  paginate
} from "@/lib/orders"
import type {
  KitchenBoardData,
  KitchenCancellationNotice,
  KitchenReadyPage,
  KitchenStatus,
  OrderTicket,
  PaymentTiming
} from "@/lib/types/order"
import { cn } from "@/lib/utils"

const kitchenViews = ["activas", "listas"] as const
const kitchenFilters = ["todas", "nuevas", "preparando"] as const

type KitchenFilter = (typeof kitchenFilters)[number]

const filterStatus = {
  todas: null,
  nuevas: "NEW",
  preparando: "PREPARING"
} as const satisfies Record<KitchenFilter, KitchenStatus | null>

export const kitchenQueryParsers = {
  vista: parseAsStringLiteral(kitchenViews)
    .withDefault("activas")
    .withOptions({ shallow: false, scroll: false }),
  estado: parseAsStringLiteral(kitchenFilters).withDefault("todas"),
  pagina: parseAsInteger.withDefault(1),
  paginaListas: parseAsInteger
    .withDefault(1)
    .withOptions({ shallow: false, scroll: false })
}

export function KitchenBoard({
  board,
  readyPage,
  paymentTiming
}: {
  board: KitchenBoardData
  readyPage: KitchenReadyPage | null
  paymentTiming: PaymentTiming
}) {
  const [query, setQuery] = useQueryStates(kitchenQueryParsers)
  const live = useLiveRefresh(readyPage?.serverTime ?? board.serverTime)

  const { execute: executeAdvance, optimisticState: activeOrders } =
    useOptimisticAction(advanceKitchenOrder, {
      currentState: board.active,
      updateFn: (state, input) =>
        state.flatMap(order => {
          if (order.id !== input.orderId) return [order]

          const next = getNextKitchenStatus(input.from)
          return next && next !== "READY"
            ? [{ ...order, kitchenStatus: next }]
            : []
        }),
      onSuccess: ({ data, input }) => {
        if (data?.failure) {
          toast.error(data.failure.reason)
          return
        }

        if (getNextKitchenStatus(input.from) === "READY") {
          const order = board.active.find(item => item.id === input.orderId)
          showReadyToast(order, () =>
            executeRestore({ orderId: input.orderId })
          )
        }
      },
      onError: ({ error }) => {
        Sentry.captureException(error.serverError ?? error, {
          tags: { section: "kitchen-board" }
        })
        toast.error("No se pudo actualizar la orden. Intenta de nuevo.")
      }
    })

  const { execute: executeRestore, isPending: isRestoring } = useAction(
    restoreKitchenOrder,
    {
      onSuccess: ({ data }) => {
        if (data?.failure) toast.error(data.failure.reason)
        else toast.success("Orden de vuelta en preparación")
      },
      onError: () => toast.error("No se pudo regresar la orden a preparación")
    }
  )

  const counts = {
    todas: activeOrders.length,
    nuevas: activeOrders.filter(order => order.kitchenStatus === "NEW").length,
    preparando: activeOrders.filter(
      order => order.kitchenStatus === "PREPARING"
    ).length
  } satisfies Record<KitchenFilter, number>

  const status = filterStatus[query.estado]
  const visibleOrders = status
    ? activeOrders.filter(order => order.kitchenStatus === status)
    : activeOrders

  const isReadyView = query.vista === "listas"

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div
        className="flex flex-col gap-3 lg:flex-row lg:items-center
          lg:justify-between"
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <ChefHat aria-hidden className="size-6" />
            Cocina
          </h1>
          <LiveStatus
            state={live.state}
            ageMs={live.ageMs}
            onRetry={live.refresh}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!isReadyView && (
            <ToggleGroup
              type="single"
              variant="outline"
              value={query.estado}
              onValueChange={value => {
                if (value) {
                  void setQuery({ estado: value as KitchenFilter, pagina: 1 })
                }
              }}
              aria-label="Filtrar por estado"
            >
              <FilterItem value="todas" label="Todas" count={counts.todas} />
              <FilterItem value="nuevas" label="Nuevas" count={counts.nuevas} />
              <FilterItem
                value="preparando"
                label="Preparando"
                count={counts.preparando}
              />
            </ToggleGroup>
          )}
          <ToggleGroup
            type="single"
            variant="outline"
            value={query.vista}
            onValueChange={value => {
              if (value) {
                void setQuery({
                  vista: value as (typeof kitchenViews)[number],
                  paginaListas: 1
                })
              }
            }}
            aria-label="Vista"
          >
            <ToggleGroupItem value="activas" className="h-11 px-4">
              Activas
            </ToggleGroupItem>
            <ToggleGroupItem value="listas" className="h-11 px-4">
              Listas
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {!live.canWrite && (
        <p className="text-muted-foreground text-sm">
          Las acciones se habilitan cuando la pantalla vuelva a actualizarse.
        </p>
      )}

      <CancellationNotices
        notices={board.cancellations}
        disabled={!live.canWrite}
      />

      {isReadyView ? (
        <ReadyOrders
          readyPage={readyPage}
          now={live.now}
          disabled={!live.canWrite || isRestoring}
          onRestore={orderId => executeRestore({ orderId })}
          onPageChange={page => void setQuery({ paginaListas: page })}
        />
      ) : (
        <ActiveOrdersGrid
          orders={visibleOrders}
          totalActive={activeOrders.length}
          page={query.pagina}
          now={live.now}
          paymentTiming={paymentTiming}
          disabled={!live.canWrite}
          onPageChange={page => void setQuery({ pagina: page })}
          onAdvance={order =>
            executeAdvance({ orderId: order.id, from: order.kitchenStatus })
          }
        />
      )}
    </div>
  )
}

function showReadyToast(order: OrderTicket | undefined, onUndo: () => void) {
  const number = order ? formatOrderNumber(order.number) : "La orden"

  toast.success(
    currentToast => (
      <span className="flex items-center gap-3">
        <span>{number} lista</span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-10"
          onClick={() => {
            toast.dismiss(currentToast.id)
            onUndo()
          }}
        >
          <RotateCcw data-icon="inline-start" />
          Deshacer
        </Button>
      </span>
    ),
    { duration: 6000 }
  )
}

function FilterItem({
  value,
  label,
  count
}: {
  value: KitchenFilter
  label: string
  count: number
}) {
  return (
    <ToggleGroupItem value={value} className="h-11 gap-2 px-4">
      {label}
      <span className="text-muted-foreground tabular-nums">{count}</span>
    </ToggleGroupItem>
  )
}

function ActiveOrdersGrid({
  orders,
  totalActive,
  page,
  now,
  paymentTiming,
  disabled,
  onPageChange,
  onAdvance
}: {
  orders: OrderTicket[]
  totalActive: number
  page: number
  now: number
  paymentTiming: PaymentTiming
  disabled: boolean
  onPageChange: (page: number) => void
  onAdvance: (order: OrderTicket) => void
}) {
  const gridRef = useRef<HTMLDivElement | null>(null)
  const [columns, setColumns] = useState(3)

  useLayoutEffect(() => {
    const grid = gridRef.current
    if (!grid) return

    const measure = () =>
      setColumns(getKitchenBoardColumns(grid.getBoundingClientRect().width))

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(grid)
    return () => observer.disconnect()
  }, [])

  const pageSize = getKitchenPageSize(columns)
  const current = paginate(orders, page, pageSize)
  const isSingleColumn = columns === 1

  return (
    <>
      <div
        ref={gridRef}
        className={cn("grid gap-3", !isSingleColumn && "min-h-0 flex-1")}
        style={
          isSingleColumn
            ? undefined
            : {
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                gridTemplateRows: "repeat(2, minmax(0, 1fr))"
              }
        }
      >
        {current.items.length === 0 ? (
          <BoardEmptyState
            hasOrders={totalActive > 0}
            paymentTiming={paymentTiming}
          />
        ) : (
          current.items.map(order => (
            <KitchenTicket
              key={order.id}
              ticket={order}
              now={now}
              fill={!isSingleColumn}
              action={{
                label:
                  order.kitchenStatus === "NEW" ? "Preparar" : "Marcar lista",
                icon:
                  order.kitchenStatus === "NEW" ? (
                    <Flame data-icon="inline-start" />
                  ) : (
                    <CircleCheck data-icon="inline-start" />
                  ),
                disabled,
                onClick: () => onAdvance(order)
              }}
            />
          ))
        )}
      </div>

      {current.pageCount > 1 && (
        <Pager
          page={current.page}
          pageCount={current.pageCount}
          summary={
            current.remaining > 0
              ? `${current.remaining} ${current.remaining === 1 ? "orden más" : "órdenes más"}`
              : `${orders.length} órdenes`
          }
          onPageChange={onPageChange}
        />
      )}
    </>
  )
}

function BoardEmptyState({
  hasOrders,
  paymentTiming
}: {
  hasOrders: boolean
  paymentTiming: PaymentTiming
}) {
  return (
    <Empty className="col-span-full row-span-full rounded-xl border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CookingPot />
        </EmptyMedia>
        <EmptyTitle>
          {hasOrders ? "Sin órdenes con este estado" : "Sin órdenes activas"}
        </EmptyTitle>
        <EmptyDescription>
          {hasOrders
            ? "Cambia el filtro para ver el resto de las órdenes activas."
            : paymentTiming === "PAY_ON_DELIVERY"
              ? "Las órdenes enviadas desde el punto de venta aparecerán aquí automáticamente."
              : "Las ventas completadas en el punto de venta aparecerán aquí automáticamente."}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

function Pager({
  page,
  pageCount,
  summary,
  onPageChange
}: {
  page: number
  pageCount: number
  summary: string
  onPageChange: (page: number) => void
}) {
  return (
    <nav
      aria-label="Paginación de órdenes"
      className="flex shrink-0 items-center justify-between gap-3"
    >
      <Button
        type="button"
        variant="outline"
        className="h-12 min-w-32 text-base"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft data-icon="inline-start" />
        Anterior
      </Button>
      <p className="text-center text-sm tabular-nums" aria-live="polite">
        <span className="font-semibold">
          Página {page} de {pageCount}
        </span>
        <span className="text-muted-foreground block">{summary}</span>
      </p>
      <Button
        type="button"
        variant="outline"
        className="h-12 min-w-32 text-base"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
      >
        Siguiente
        <ChevronRight data-icon="inline-end" />
      </Button>
    </nav>
  )
}

function ReadyOrders({
  readyPage,
  now,
  disabled,
  onRestore,
  onPageChange
}: {
  readyPage: KitchenReadyPage | null
  now: number
  disabled: boolean
  onRestore: (orderId: string) => void
  onPageChange: (page: number) => void
}) {
  if (!readyPage) return null

  if (readyPage.orders.length === 0) {
    return (
      <Empty className="min-h-80 rounded-xl border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CircleCheck />
          </EmptyMedia>
          <EmptyTitle>Aún no hay órdenes listas</EmptyTitle>
          <EmptyDescription>
            Las órdenes marcadas como listas aparecerán aquí por si necesitas
            regresarlas a preparación.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const pageCount = Math.max(
    1,
    Math.ceil(readyPage.totalCount / readyPage.pageSize)
  )

  return (
    <>
      <div
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3
          2xl:grid-cols-4"
      >
        {readyPage.orders.map(order => (
          <KitchenTicket
            key={order.id}
            ticket={order}
            now={now}
            elapsedFrom={order.readyAt ?? order.submittedAt}
            fill={false}
            action={{
              label: "Volver a preparar",
              icon: <RotateCcw data-icon="inline-start" />,
              variant: "outline",
              disabled,
              onClick: () => onRestore(order.id)
            }}
          />
        ))}
      </div>
      {pageCount > 1 && (
        <Pager
          page={readyPage.page}
          pageCount={pageCount}
          summary={`${readyPage.totalCount} órdenes listas`}
          onPageChange={onPageChange}
        />
      )}
    </>
  )
}

function CancellationNotices({
  notices,
  disabled
}: {
  notices: KitchenCancellationNotice[]
  disabled: boolean
}) {
  const { execute, isPending } = useAction(acknowledgeOrderCancellation, {
    onError: () => toast.error("No se pudo confirmar el aviso")
  })

  if (notices.length === 0) return null

  return (
    <div
      className="flex shrink-0 flex-col gap-2"
      role="region"
      aria-label="Órdenes canceladas"
    >
      {notices.map(notice => (
        <Alert
          key={notice.id}
          variant="destructive"
          className="flex flex-col gap-3 sm:flex-row sm:items-center
            sm:justify-between"
        >
          <div className="flex gap-3">
            <OctagonX aria-hidden className="mt-0.5 size-5 shrink-0" />
            <div>
              <AlertTitle className="text-base">
                Orden {formatOrderNumber(notice.number)}
                {notice.label ? ` · ${notice.label}` : ""} cancelada
              </AlertTitle>
              <AlertDescription>
                {notice.cancelReason ? `Motivo: ${notice.cancelReason}. ` : ""}
                Detén su preparación.
              </AlertDescription>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-12 shrink-0 px-6"
            disabled={disabled || isPending}
            onClick={() => execute({ orderId: notice.id })}
          >
            Entendido
          </Button>
        </Alert>
      ))}
    </div>
  )
}
