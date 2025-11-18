import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex grow items-start justify-center">
      <div className="w-full max-w-4xl space-y-6 px-4 py-6 sm:px-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-3/4" />
      </div>
    </div>
  )
}
