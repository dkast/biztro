"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import toast from "react-hot-toast"
import * as Sentry from "@sentry/nextjs"
import { bind, play, setEnabled, setTheme } from "cuelume"
import { useAtom } from "jotai"
import {
  ChefHat,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CookingPot,
  Flame,
  GalleryHorizontal,
  Grid3x2,
  OctagonX,
  RotateCcw,
  Volume2,
  VolumeX
} from "lucide-react"
import { useAction, useOptimisticAction } from "next-safe-action/hooks"
import { parseAsInteger, parseAsStringLiteral, useQueryStates } from "nuqs"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import { KitchenTicket } from "@/components/kitchen/kitchen-ticket"
import { LiveStatus } from "@/components/orders/live-status"
import {
  OrderSnapshotUnavailable,
  useOrderSnapshot
} from "@/components/orders/order-snapshot"
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
import { isSoundMutedAtom, kitchenRowsAtom } from "@/lib/atoms"
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
  OrderSnapshotResult,
  OrderTicket,
  PaymentTiming
} from "@/lib/types/order"
import { cn } from "@/lib/utils"

const kitchenViews = ["activas", "listas"] as const
const kitchenFilters = ["todas", "nuevas", "preparando"] as const
const kitchenRows = ["2", "1"] as const
// Connected groups override item padding, so the touch-size padding needs the group variant.
const kitchenToggleItemClass = "h-11 group-data-[spacing=0]/toggle-group:px-4"

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

export type KitchenSnapshot = {
  board: KitchenBoardData
  readyPage: KitchenReadyPage | null
  paymentTiming: PaymentTiming
}

export function KitchenBoard({
  snapshot,
  organizationId
}: {
  snapshot: OrderSnapshotResult<KitchenSnapshot>
  organizationId: string
}) {
  const { data, hasError } = useOrderSnapshot(snapshot)
  if (!data) return <OrderSnapshotUnavailable />

  return (
    <KitchenBoardContent
      {...data}
      organizationId={organizationId}
      hasSnapshotError={hasError}
    />
  )
}

function KitchenBoardContent({
  board,
  readyPage,
  paymentTiming,
  organizationId,
  hasSnapshotError
}: KitchenSnapshot & {
  organizationId: string
  hasSnapshotError: boolean
}) {
  const [query, setQuery] = useQueryStates(kitchenQueryParsers)
  const [rows, setRows] = useAtom(kitchenRowsAtom)
  const [isSoundMuted, setIsSoundMuted] = useAtom(isSoundMutedAtom)
  const knownOrderIds = useRef<Set<string> | null>(null)
  const knownNoticeIds = useRef<Set<string> | null>(null)
  const live = useLiveRefresh(
    readyPage?.serverTime ?? board.serverTime,
    organizationId,
    hasSnapshotError
  )

  useEffect(() => {
    setEnabled(!isSoundMuted)
  }, [isSoundMuted])

  useEffect(() => {
    setTheme("press")
    return bind()
  }, [])

  // Compare against the previous snapshot so only tickets that arrive later make noise.
  useEffect(() => {
    const known = knownOrderIds.current
    knownOrderIds.current = new Set(board.active.map(order => order.id))
    if (
      known &&
      board.active.some(
        order => order.kitchenStatus === "NEW" && !known.has(order.id)
      )
    )
      play("attention")
  }, [board.active])

  useEffect(() => {
    const known = knownNoticeIds.current
    knownNoticeIds.current = new Set(board.cancellations.map(item => item.id))
    if (known && board.cancellations.some(item => !known.has(item.id)))
      play("warning")
  }, [board.cancellations])

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
          play("error")
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
        play("error")
        toast.error("No se pudo actualizar la orden. Intenta de nuevo.")
      }
    })

  const { execute: executeRestore, isPending: isRestoring } = useAction(
    restoreKitchenOrder,
    {
      onSuccess: ({ data }) => {
        if (data?.failure) {
          play("error")
          toast.error(data.failure.reason)
        } else {
          play("navigate", { direction: "back", emphasis: "subtle" })
          toast.success("Orden de vuelta en preparación")
        }
      },
      onError: () => {
        play("error")
        toast.error("No se pudo regresar la orden a preparación")
      }
    }
  )

  const handleAdvance = (order: OrderTicket) => {
    play(
      getNextKitchenStatus(order.kitchenStatus) === "READY" ? "success" : "tap"
    )
    executeAdvance({ orderId: order.id, from: order.kitchenStatus })
  }

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
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
      <div
        className="flex flex-col gap-3 lg:flex-row lg:items-center
          lg:justify-between"
      >
        <PageSubtitle
          className="gap-3 sm:flex-col sm:items-start lg:flex-row
            lg:items-center"
        >
          <PageSubtitle.Icon icon={ChefHat} />
          <PageSubtitle.Title as="h1" className="text-2xl leading-7">
            Cocina
          </PageSubtitle.Title>
          <PageSubtitle.Actions className="mt-0 md:ml-0">
            <LiveStatus
              state={live.state}
              ageMs={live.ageMs}
              onRetry={live.refresh}
            />
          </PageSubtitle.Actions>
        </PageSubtitle>
        <div className="flex flex-wrap items-center gap-2">
          {!isReadyView && (
            <ToggleGroup
              spacing={0}
              variant="outline"
              value={[rows]}
              onValueChange={([value]) => {
                if (value) {
                  setRows(value as (typeof kitchenRows)[number])
                  void setQuery({ pagina: 1 })
                }
              }}
              aria-label="Distribución de tickets"
            >
              <ToggleGroupItem
                value="2"
                className="size-11 p-0"
                aria-label="Dos filas"
                title="Dos filas"
                data-cuelume-select
              >
                <Grid3x2 aria-hidden />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="1"
                className="size-11 p-0"
                aria-label="Una fila con desplazamiento horizontal"
                title="Una fila con desplazamiento horizontal"
                data-cuelume-select
              >
                <GalleryHorizontal aria-hidden />
              </ToggleGroupItem>
            </ToggleGroup>
          )}
          {!isReadyView && (
            <ToggleGroup
              spacing={0}
              variant="outline"
              value={[query.estado]}
              onValueChange={([value]) => {
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
            spacing={0}
            variant="outline"
            value={[query.vista]}
            onValueChange={([value]) => {
              if (value) {
                void setQuery({
                  vista: value as (typeof kitchenViews)[number],
                  paginaListas: 1
                })
              }
            }}
            aria-label="Vista"
          >
            <ToggleGroupItem
              value="activas"
              className={kitchenToggleItemClass}
              data-cuelume-select
            >
              Activas
            </ToggleGroupItem>
            <ToggleGroupItem
              value="listas"
              className={kitchenToggleItemClass}
              data-cuelume-select
            >
              Listas
            </ToggleGroupItem>
          </ToggleGroup>
          <Button
            type="button"
            variant="outline"
            className="size-11 p-0"
            aria-label={isSoundMuted ? "Activar sonidos" : "Silenciar sonidos"}
            title={isSoundMuted ? "Activar sonidos" : "Silenciar sonidos"}
            onClick={() => {
              const nextMuted = !isSoundMuted
              setIsSoundMuted(nextMuted)
              setEnabled(!nextMuted)
              if (!nextMuted) play("toggle")
            }}
          >
            {isSoundMuted ? <VolumeX aria-hidden /> : <Volume2 aria-hidden />}
          </Button>
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
          isSingleRow={rows === "1"}
          now={live.now}
          paymentTiming={paymentTiming}
          disabled={!live.canWrite}
          onPageChange={page => void setQuery({ pagina: page })}
          onAdvance={handleAdvance}
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
          className="h-10 bg-transparent text-white inset-ring-white/30
            hover:bg-white/15 hover:text-white"
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
    <ToggleGroupItem
      value={value}
      className={cn(kitchenToggleItemClass, "gap-2")}
      data-cuelume-select
    >
      {label}
      <span className="text-muted-foreground tabular-nums">{count}</span>
    </ToggleGroupItem>
  )
}

function ActiveOrdersGrid({
  orders,
  totalActive,
  page,
  isSingleRow,
  now,
  paymentTiming,
  disabled,
  onPageChange,
  onAdvance
}: {
  orders: OrderTicket[]
  totalActive: number
  page: number
  isSingleRow: boolean
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
  }, [isSingleRow])

  const pageSize = getKitchenPageSize(columns)
  const current = paginate(orders, page, pageSize)
  const isSingleColumn = columns === 1
  const visibleOrders = isSingleRow ? orders : current.items
  const hasFill = isSingleRow || !isSingleColumn
  // Reveal part of the next ticket so the row reads as scrollable.
  const visibleColumns =
    visibleOrders.length > columns ? columns + 0.35 : columns
  const ticketWidth = `calc((100% - ${columns} * 0.75rem) / ${visibleColumns})`

  return (
    <>
      <div
        ref={gridRef}
        className={cn(
          hasFill && "min-h-0 flex-1",
          isSingleRow
            ? `relative flex snap-x snap-proximity gap-3 overflow-x-auto
              overflow-y-hidden pb-2`
            : "grid gap-3"
        )}
        style={
          isSingleRow || isSingleColumn
            ? undefined
            : {
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                gridTemplateRows: "repeat(2, minmax(0, 1fr))"
              }
        }
      >
        {visibleOrders.length === 0 ? (
          <BoardEmptyState
            hasOrders={totalActive > 0}
            paymentTiming={paymentTiming}
          />
        ) : (
          visibleOrders.map(order => (
            <div
              key={order.id}
              className={cn(
                "min-w-0",
                isSingleRow ? "flex shrink-0 snap-start" : "contents"
              )}
              style={isSingleRow ? { width: ticketWidth } : undefined}
            >
              <KitchenTicket
                ticket={order}
                now={now}
                fill={hasFill}
                action={{
                  label:
                    order.kitchenStatus === "NEW" ? "Preparar" : "Marcar lista",
                  variant:
                    order.kitchenStatus === "NEW" ? "warning" : "success",
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
            </div>
          ))
        )}
      </div>

      {!isSingleRow && current.pageCount > 1 && (
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
    <Empty className="col-span-full row-span-full w-full rounded-xl border">
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
