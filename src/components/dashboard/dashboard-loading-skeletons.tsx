import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type PageSubtitleSkeletonProps = {
  actionCount?: number
  className?: string
  descriptionWidth?: string
  titleWidth?: string
}

type DashboardTableSkeletonProps = {
  className?: string
  columnCount?: number
  rowCount?: number
}

type DashboardFormSkeletonProps = {
  className?: string
  fieldCount?: number
}

function PageSubtitleSkeleton({
  actionCount = 0,
  className,
  descriptionWidth = "w-56",
  titleWidth = "w-36"
}: PageSubtitleSkeletonProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start justify-between gap-4 sm:flex-row",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <Skeleton className="size-10 shrink-0 rounded-lg" />
        <div className="flex min-w-0 flex-col gap-2">
          <Skeleton className={cn("h-5", titleWidth)} />
          <Skeleton className={cn("h-4 max-w-[72vw]", descriptionWidth)} />
        </div>
      </div>
      {actionCount > 0 && (
        <div className="flex w-full gap-2 sm:w-auto">
          {Array.from({ length: actionCount }).map((_, index) => (
            <Skeleton key={index} className="h-10 flex-1 rounded-lg sm:w-28" />
          ))}
        </div>
      )}
    </div>
  )
}

function DashboardTableSkeleton({
  className,
  columnCount = 4,
  rowCount = 6
}: DashboardTableSkeletonProps) {
  return (
    <div className={cn("overflow-hidden rounded-lg border", className)}>
      <div
        className="bg-muted/40 grid gap-4 px-4 py-3"
        style={{
          gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`
        }}
      >
        {Array.from({ length: columnCount }).map((_, index) => (
          <Skeleton key={index} className="h-4 w-20 max-w-full" />
        ))}
      </div>
      <div className="flex flex-col">
        {Array.from({ length: rowCount }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid gap-4 border-t px-4 py-4"
            style={{
              gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`
            }}
          >
            {Array.from({ length: columnCount }).map((_, columnIndex) => (
              <Skeleton
                key={columnIndex}
                className={cn(
                  "h-4 max-w-full",
                  columnIndex === 0 ? "w-32" : "w-20 justify-self-end"
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function DashboardFormSkeleton({
  className,
  fieldCount = 5
}: DashboardFormSkeletonProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {Array.from({ length: fieldCount }).map((_, index) => (
        <div key={index} className="flex flex-col gap-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      ))}
      <Skeleton className="h-10 w-32 rounded-lg" />
    </div>
  )
}

function DashboardGridSkeleton({
  className,
  itemCount = 8
}: {
  className?: string
  itemCount?: number
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
        className
      )}
    >
      {Array.from({ length: itemCount }).map((_, index) => (
        <Skeleton key={index} className="aspect-square rounded-lg" />
      ))}
    </div>
  )
}

function MetricGridSkeleton({
  className,
  count = 4
}: {
  className?: string
  count?: number
}) {
  return (
    <section className={cn("overflow-hidden rounded-lg border", className)}>
      <div className="grid grid-cols-2 md:grid-cols-4">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "flex min-w-0 items-center justify-between gap-4 p-4 sm:p-5",
              index < 2 && "border-b md:border-b-0",
              index % 2 === 0 && "border-r md:border-r-0",
              index < count - 1 && "md:border-r"
            )}
          >
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-7 w-28" />
            </div>
            <Skeleton className="size-8 shrink-0 rounded-xl" />
          </div>
        ))}
      </div>
    </section>
  )
}

function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <Skeleton className="h-[13rem] rounded-2xl sm:h-[16rem] lg:h-[18rem]" />
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-3 rounded-full" />
        ))}
      </div>
    </div>
  )
}

function DashboardHomeLoadingSkeleton() {
  return (
    <div className="relative flex grow pb-4">
      <div
        className="z-10 mx-auto grid grow auto-rows-min justify-center gap-10
          px-4 py-10 sm:grid-cols-300 sm:px-6 sm:py-12"
      >
        <div className="col-span-full flex flex-col gap-8">
          <Skeleton className="h-12 w-1/2" />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-28 w-full" />
            ))}
          </div>
        </div>
        <div className="col-span-full">
          <PageSubtitleSkeleton
            descriptionWidth="w-72"
            titleWidth="w-24"
            actionCount={1}
          />
        </div>
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-[250px]" />
        ))}
      </div>
    </div>
  )
}

function MenuItemsLoadingSkeleton() {
  return (
    <div className="mx-auto grow px-4 sm:px-6">
      <PageSubtitleSkeleton actionCount={2} />
      <DashboardTableSkeleton className="mt-6" columnCount={5} />
    </div>
  )
}

function CategoriesLoadingSkeleton() {
  return (
    <div className="mx-auto grow px-4 sm:px-6">
      <PageSubtitleSkeleton actionCount={1} />
      <DashboardTableSkeleton className="mt-6" columnCount={3} />
    </div>
  )
}

function MenuImportLoadingSkeleton() {
  return (
    <div className="mx-auto w-full min-w-0 grow px-4 sm:px-6">
      <PageSubtitleSkeleton descriptionWidth="w-96" titleWidth="w-52" />
      <div className="mt-10 flex flex-col gap-6">
        <Skeleton className="h-48 rounded-lg" />
        <DashboardFormSkeleton fieldCount={3} />
      </div>
    </div>
  )
}

function TranslationsLoadingSkeleton() {
  return (
    <div className="mx-auto grow px-4 sm:px-6">
      <PageSubtitleSkeleton actionCount={1} titleWidth="w-52" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-11 rounded-lg" />
          ))}
        </div>
        <DashboardTableSkeleton columnCount={3} rowCount={6} />
      </div>
    </div>
  )
}

function SettingsGeneralLoadingSkeleton() {
  return (
    <div className="mx-auto max-w-2xl grow px-4 sm:px-0">
      <div className="flex items-center justify-between gap-4">
        <PageSubtitleSkeleton titleWidth="w-44" />
        <Skeleton className="h-6 w-20 rounded-md" />
      </div>
      <DashboardFormSkeleton className="mt-8" fieldCount={6} />
    </div>
  )
}

function SettingsLocationsLoadingSkeleton() {
  return (
    <div className="mx-auto max-w-2xl grow px-4 sm:px-0">
      <PageSubtitleSkeleton />
      <DashboardFormSkeleton className="mt-8" fieldCount={5} />
      <Skeleton className="my-8 h-px w-full" />
      <PageSubtitleSkeleton titleWidth="w-48" />
      <DashboardFormSkeleton className="mt-8" fieldCount={4} />
    </div>
  )
}

function SettingsMembersLoadingSkeleton() {
  return (
    <div className="mx-auto grow px-4 sm:px-6">
      <PageSubtitleSkeleton actionCount={1} />
      <DashboardTableSkeleton className="mt-6" columnCount={4} />
    </div>
  )
}

function SettingsBillingLoadingSkeleton() {
  return (
    <div className="mx-auto max-w-2xl grow px-4 sm:px-0">
      <PageSubtitleSkeleton titleWidth="w-48" />
      <div className="my-10 flex flex-col gap-6">
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
      </div>
    </div>
  )
}

function MediaLoadingSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b">
        <PageSubtitleSkeleton
          className="px-6 py-4"
          descriptionWidth="w-32"
          titleWidth="w-48"
        />
      </div>
      <div className="flex-1 overflow-auto p-6">
        <DashboardGridSkeleton itemCount={12} />
      </div>
    </div>
  )
}

function SalesOverviewLoadingSkeleton() {
  return (
    <div
      className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:gap-8
        sm:px-6 sm:py-6"
    >
      <PageSubtitleSkeleton
        className="gap-3 pb-4 sm:items-end sm:gap-4 sm:pb-5"
        actionCount={1}
      />
      <MetricGridSkeleton />
      <section className="flex flex-col gap-5 py-6 sm:gap-6 sm:py-8">
        <div
          className="flex flex-col items-start gap-2 sm:flex-row sm:items-center
            sm:justify-between"
        >
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-6 w-24 rounded-md" />
        </div>
        <ChartSkeleton />
      </section>
      <section
        className="grid gap-y-8 lg:grid-cols-[minmax(0,60fr)_minmax(0,40fr)]
          lg:gap-x-12"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-6 w-10 rounded-md" />
          </div>
          <DashboardTableSkeleton columnCount={5} rowCount={5} />
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-6 w-10 rounded-md" />
          </div>
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </section>
    </div>
  )
}

function NewSaleLoadingSkeleton() {
  return (
    <div
      className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6"
    >
      <div
        className="grid gap-6
          lg:grid-cols-[minmax(0,1.25fr)_minmax(260px,420px)]"
      >
        <section className="flex min-w-0 flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
            <Skeleton className="h-11 rounded-lg" />
            <Skeleton className="h-11 w-full rounded-lg md:w-56" />
          </div>
          <div className="flex gap-2 overflow-hidden">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-9 w-24 shrink-0 rounded-md" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <Skeleton key={index} className="h-40 rounded-lg" />
            ))}
          </div>
        </section>
        <aside
          className="flex min-h-[32rem] flex-col gap-4 rounded-lg border p-4"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
          <div className="flex flex-1 flex-col gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-16 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-px w-full" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-6 w-28" />
          </div>
          <Skeleton className="h-11 rounded-lg" />
        </aside>
      </div>
    </div>
  )
}

function SalesClosingLoadingSkeleton() {
  return (
    <div
      className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:gap-8
        sm:px-6 sm:py-6"
    >
      <PageSubtitleSkeleton
        className="gap-3 pb-4 sm:items-end sm:gap-4 sm:pb-5"
        actionCount={2}
        titleWidth="w-36"
      />
      <MetricGridSkeleton count={6} />
      <section className="flex flex-col gap-4">
        <Skeleton className="h-5 w-32" />
        <ChartSkeleton />
      </section>
      <section className="grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-10">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-6 w-10 rounded-md" />
          </div>
          <DashboardTableSkeleton columnCount={3} rowCount={4} />
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-6 w-10 rounded-md" />
          </div>
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </section>
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-6 w-10 rounded-md" />
        </div>
        <DashboardTableSkeleton columnCount={5} rowCount={6} />
      </section>
    </div>
  )
}

function SaleDetailLoadingSkeleton() {
  return (
    <div
      className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-5 sm:px-6
        sm:py-6"
    >
      <PageSubtitleSkeleton titleWidth="w-40" descriptionWidth="w-72" />
      <div className="flex flex-col gap-5 pb-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-36" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-24 rounded-md" />
              <Skeleton className="h-6 w-24 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-6">
          <div className="rounded-lg border p-5">
            <Skeleton className="h-5 w-24" />
            <div className="mt-5 flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-14 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-56 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}

function SaleDetailSheetLoadingSkeleton() {
  return (
    <div
      className="bg-background ml-auto flex h-[calc(100%-1rem)]
        w-[calc(100%-1rem)] max-w-2xl flex-col gap-0 overflow-hidden rounded-lg
        border"
    >
      <div className="flex flex-col gap-2 border-b px-5 py-4 sm:px-6 sm:py-5">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
        <SaleDetailLoadingSkeleton />
      </div>
    </div>
  )
}

export {
  CategoriesLoadingSkeleton,
  DashboardFormSkeleton,
  DashboardGridSkeleton,
  DashboardHomeLoadingSkeleton,
  DashboardTableSkeleton,
  MediaLoadingSkeleton,
  MenuImportLoadingSkeleton,
  MenuItemsLoadingSkeleton,
  NewSaleLoadingSkeleton,
  PageSubtitleSkeleton,
  SaleDetailLoadingSkeleton,
  SaleDetailSheetLoadingSkeleton,
  SalesClosingLoadingSkeleton,
  SalesOverviewLoadingSkeleton,
  SettingsBillingLoadingSkeleton,
  SettingsGeneralLoadingSkeleton,
  SettingsLocationsLoadingSkeleton,
  SettingsMembersLoadingSkeleton,
  TranslationsLoadingSkeleton
}
