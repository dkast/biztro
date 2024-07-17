import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="absolute inset-0 z-20 flex grow items-center justify-center">
      <Skeleton className="h-2 w-32" />
    </div>
  )
}
