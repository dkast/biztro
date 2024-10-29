"use client"

import { useTransition } from "react"
import toast from "react-hot-toast"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  ChevronsUpDown,
  LayoutTemplate,
  Settings,
  ShoppingBag,
  type LucideIcon
} from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import Link from "next/link"
import {
  usePathname,
  useRouter,
  useSelectedLayoutSegment
} from "next/navigation"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { switchOrganization } from "@/server/actions/user/mutations"
import {
  getCurrentOrganization,
  getUserMemberships
} from "@/server/actions/user/queries"
import { getInitials } from "@/lib/utils"

type NavigationItem = {
  name: string
  href: string
  icon: LucideIcon
}

const navigation: NavigationItem[] = [
  { name: "Menú", href: "/dashboard", icon: LayoutTemplate },
  {
    name: "Productos",
    href: "/dashboard/menu-items",
    icon: ShoppingBag
  },
  {
    name: "Configuración",
    href: "/dashboard/settings",
    icon: Settings
  }
]

export default function AppSidebar() {
  return (
    <Sidebar>
      <SidebarWorkgroup />
      <SidebarContent>
        <SidebarGroup>
          <SidebarContent>
            <SidebarMenu>
              {navigation.map(item => (
                <SidebarMenuItem key={item.name}>
                  <SidebarLink item={item} />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

function SidebarLink({ item }: { item: NavigationItem }) {
  const pathname = usePathname()
  const segment = useSelectedLayoutSegment()

  let isActive = false
  if (!segment || segment === "(start)") {
    isActive = pathname?.includes(item.href) ?? false
  } else {
    isActive = item.href.includes(segment)
  }

  return (
    <SidebarMenuButton asChild isActive={isActive}>
      <Link href={item.href}>
        <item.icon />
        <span>{item.name}</span>
      </Link>
    </SidebarMenuButton>
  )
}

function SidebarWorkgroup() {
  const { data: currentOrg } = useQuery({
    queryKey: ["workgroup", "current"],
    queryFn: getCurrentOrganization
  })

  const { data: memberships } = useQuery({
    queryKey: ["workgroup", "memberships"],
    queryFn: getUserMemberships
  })

  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const { execute, status } = useAction(switchOrganization, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        // Revalidate the current organization
        queryClient.invalidateQueries({
          queryKey: ["workgroup", "current"]
        })
        // router.replace("/dashboard")
        startTransition(() => {
          router.replace("/dashboard")
        })
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

  if (!currentOrg || status === "executing" || isPending)
    return (
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex flex-row items-center gap-2 p-1.5">
            <Skeleton className="size-8 bg-gray-200" />
            <Skeleton className="h-6 w-24 bg-gray-200" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
    )

  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Avatar className="size-8 rounded shadow">
                    <AvatarImage src={currentOrg.logo ?? undefined} />
                    <AvatarFallback className="text-xs">
                      {getInitials(currentOrg.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {currentOrg.name}
                  </span>
                  <span className="truncate text-xs">{currentOrg.plan}</span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              align="start"
              side="bottom"
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                Organizaciones
              </DropdownMenuLabel>
              {memberships?.map((membership, index) => (
                <DropdownMenuItem
                  key={membership.organization.name}
                  onClick={() =>
                    handleSwitchOrganization(membership.organization.id)
                  }
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    <Avatar className="size-5 rounded-sm shadow">
                      <AvatarImage
                        src={membership.organization.logo ?? undefined}
                      />
                      <AvatarFallback className="text-xs">
                        {getInitials(membership.organization.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  {membership.organization.name}
                  {/* <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut> */}
                </DropdownMenuItem>
              ))}
              {/* <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 p-2">
                <div className="bg-background flex size-6 items-center justify-center rounded-md border">
                  <Plus className="size-4" />
                </div>
                <div className="text-muted-foreground font-medium">
                  Add team
                </div>
              </DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  )
}
