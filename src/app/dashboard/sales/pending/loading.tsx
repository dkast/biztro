import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div
      className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6
        sm:py-6"
      aria-busy
      aria-label="Cargando órdenes por cobrar"
    >
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-lg" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-80 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
