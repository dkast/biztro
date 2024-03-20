"use client"

import { useSuspenseQuery } from "@tanstack/react-query"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { getCurrentOrganization } from "@/server/actions/user/queries"
import { cn, getInitials } from "@/lib/utils"

export default function Workgroup({ className }: { className?: string }) {
  const { data } = useSuspenseQuery({
    queryKey: ["workgroup", "current"],
    queryFn: () => getCurrentOrganization()
  })

  console.dir(data)

  if (!data)
    return (
      <div className="flex flex-row items-center gap-2">
        <Skeleton className="size-10 bg-gray-200" />
        <Skeleton className="h-6 w-24 bg-gray-200" />
      </div>
    )

  return (
    <div className={cn("flex flex-row items-center gap-2", className)}>
      <Avatar className="rounded-lg shadow">
        <AvatarImage src={data.logo ?? undefined} />
        <AvatarFallback>{getInitials(data.name)}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col items-start">
        <span className="line-clamp-1 text-sm font-semibold">{data.name}</span>
        <span className="text-xs font-semibold text-gray-400">Negocio</span>
      </div>
    </div>
  )
}
