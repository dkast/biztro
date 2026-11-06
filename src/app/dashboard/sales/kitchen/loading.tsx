import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div
      className="flex w-full flex-col gap-3 px-4 py-4 sm:h-[calc(100dvh-4rem)]
        sm:px-6"
      aria-busy
      aria-label="Cargando cocina"
    >
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-11 w-72" />
      </div>
      <div
        className="grid min-h-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2
          sm:grid-rows-2 lg:grid-cols-3"
      >
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-64 rounded-xl sm:h-full" />
        ))}
      </div>
    </div>
  )
}
