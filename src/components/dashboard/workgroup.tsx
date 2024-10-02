"use client"

import toast from "react-hot-toast"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { ChevronsUpDown } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { switchOrganization } from "@/server/actions/user/mutations"
import {
  getCurrentOrganization,
  getUserMemberships
} from "@/server/actions/user/queries"
import { cn, getInitials } from "@/lib/utils"

export default function Workgroup({ className }: { className?: string }) {
  const { data: currentOrg } = useQuery({
    queryKey: ["workgroup", "current"],
    queryFn: getCurrentOrganization
  })

  const { data: memberships } = useQuery({
    queryKey: ["workgroup", "memberships"],
    queryFn: getUserMemberships
  })

  const queryClient = useQueryClient()
  const router = useRouter()

  const { execute, status } = useAction(switchOrganization, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        // Revalidate the current organization
        queryClient.invalidateQueries({
          queryKey: ["workgroup", "current"]
        })
        router.replace("/dashboard")
      } else if (data?.failure?.reason) {
        toast.error(data.failure.reason)
      }
    },
    onError: error => {
      console.error(error)
      toast.error("No se pudo cambiar de organización")
    }
  })

  const handleSwitchOrganization = async (organizationId: string) => {
    await execute({
      organizationId
    })
  }

  if (!currentOrg || status === "executing")
    return (
      <div className="flex flex-row items-center gap-2">
        <Skeleton className="size-10 bg-gray-200" />
        <Skeleton className="h-6 w-24 bg-gray-200" />
      </div>
    )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "flex h-12 w-full flex-row items-center justify-start gap-3 px-2",
            className
          )}
        >
          <Avatar className="size-6 rounded shadow">
            <AvatarImage src={currentOrg.logo ?? undefined} />
            <AvatarFallback>{getInitials(currentOrg.name)}</AvatarFallback>
          </Avatar>
          <div className="flex grow flex-col items-start">
            <span className="line-clamp-1 text-xs font-semibold">
              {currentOrg.name}
            </span>
            <span className="text-xs font-semibold text-gray-400">Negocio</span>
          </div>
          <ChevronsUpDown className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-48">
        <DropdownMenuLabel>Organizaciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {memberships?.map(membership => (
          <DropdownMenuItem
            key={membership.id}
            onSelect={() => {
              /* handle selection */
              handleSwitchOrganization(membership.organization.id)
            }}
          >
            {membership.organization.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// export default function Workgroup({ className }: { className?: string }) {
//   const { currentOrg } = useQuery({
//     queryKey: ["workgroup", "current"],
//     queryFn: getCurrentOrganization
//   })

//   const { organizations } = useQuery({
//     queryKey: ["workgroup", "organizations"],
//     queryFn: getUserMemberships
//   })

//   if (!currentOrg)
//     return (
//       <div className="flex flex-row items-center gap-2">
//         <Skeleton className="size-10 bg-gray-200" />
//         <Skeleton className="h-6 w-24 bg-gray-200" />
//       </div>
//     )

//   return (
//     <div className={cn("flex flex-row items-center gap-2", className)}>
//       <Avatar className="rounded-lg shadow">
//         <AvatarImage src={currentOrg.logo ?? undefined} />
//         <AvatarFallback>{getInitials(currentOrg.name)}</AvatarFallback>
//       </Avatar>
//       <div className="flex flex-col items-start">
//         <span className="line-clamp-1 text-sm font-semibold">{data.name}</span>
//         <span className="text-xs font-semibold text-gray-400">Negocio</span>
//       </div>
//     </div>
//   )
// }
