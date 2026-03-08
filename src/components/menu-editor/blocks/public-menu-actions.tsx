"use client"

import * as React from "react"
import toast from "react-hot-toast"
import { Menu } from "bloom-menu"
import Fuse, { type IFuseOptions } from "fuse.js"
import { MoreHorizontal, Search, Share } from "lucide-react"

import {
  ItemDetail,
  type DetailItem
} from "@/components/menu-editor/blocks/item-detail"
import { usePublicMenu } from "@/components/menu-editor/public-menu-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatPrice, resolveCurrency } from "@/lib/currency"
import type { PublicMenuSearchItem } from "@/lib/menu-search"
import { cn } from "@/lib/utils"

const bloomItemClassName =
  "text-foreground hover:bg-accent flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors"

const fuseOptions = {
  ignoreLocation: true,
  includeScore: true,
  keys: [
    {
      name: "name",
      weight: 0.7
    },
    {
      name: "description",
      weight: 0.3
    }
  ],
  minMatchCharLength: 2,
  threshold: 0.35
} satisfies IFuseOptions<PublicMenuSearchItem>

export function PublicMenuActions() {
  const publicMenu = usePublicMenu()
  const items = publicMenu?.items ?? []
  const [isActionMenuOpen, setIsActionMenuOpen] = React.useState(false)
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [pendingItem, setPendingItem] = React.useState<DetailItem | null>(null)
  const [selectedItem, setSelectedItem] = React.useState<DetailItem | null>(
    null
  )
  const deferredQuery = React.useDeferredValue(query.trim())

  const fuse = new Fuse(items, fuseOptions)
  const results = deferredQuery
    ? fuse.search(deferredQuery).map(result => result.item)
    : items

  React.useEffect(() => {
    if (!isSearchOpen && pendingItem) {
      setSelectedItem(pendingItem)
      setPendingItem(null)
    }
  }, [isSearchOpen, pendingItem])

  if (!publicMenu) {
    return null
  }

  const resultsHeading = deferredQuery
    ? `${results.length} ${results.length === 1 ? "coincidencia" : "coincidencias"}`
    : "Todos los productos"

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast("Enlace copiado")
    } catch {
      toast("No se pudo copiar el enlace")
    }
  }

  function handleSearchOpen() {
    setIsActionMenuOpen(false)
    setIsSearchOpen(true)
  }

  function handleResultSelect(item: DetailItem) {
    setPendingItem(item)
    setIsSearchOpen(false)
    setQuery("")
  }

  return (
    <>
      <Menu.Root
        open={isActionMenuOpen}
        onOpenChange={setIsActionMenuOpen}
        direction="bottom"
        anchor="end"
      >
        <Menu.Container
          buttonSize={40}
          menuWidth={180}
          menuRadius={18}
          className="border-border bg-background/95 border shadow-xl
            backdrop-blur-md"
        >
          <Menu.Trigger>
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              className="bg-background/85 hover:bg-background size-10
                rounded-full shadow-lg ring-1 ring-black/10 backdrop-blur-md"
            >
              <MoreHorizontal />
              <span className="sr-only">Abrir acciones del menú</span>
            </Button>
          </Menu.Trigger>
          <Menu.Content className="p-2">
            <Menu.Item
              className={bloomItemClassName}
              onSelect={() => {
                setIsActionMenuOpen(false)
                void handleShare()
              }}
            >
              <Share className="size-4" />
              Compartir
            </Menu.Item>
            <Menu.Item
              className={bloomItemClassName}
              onSelect={handleSearchOpen}
            >
              <Search className="size-4" />
              Buscar
            </Menu.Item>
          </Menu.Content>
        </Menu.Container>
      </Menu.Root>

      <Drawer
        open={isSearchOpen}
        onOpenChange={open => {
          setIsSearchOpen(open)
          if (!open) {
            setQuery("")
          }
        }}
      >
        <DrawerContent className="flex h-[82vh] flex-col px-0">
          <DrawerHeader className="pb-2">
            <DrawerTitle>Buscar productos</DrawerTitle>
            <DrawerDescription>
              Busca coincidencias por nombre o descripción.
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex min-h-0 flex-1 flex-col px-4 pb-4">
            <Command
              shouldFilter={false}
              className="flex min-h-0 flex-1 rounded-2xl border shadow-sm"
            >
              <CommandInput
                value={query}
                onValueChange={setQuery}
                placeholder="Tacos, picante, vegetariano..."
              />

              <ScrollArea className="min-h-0 flex-1">
                {results.length ? (
                  <CommandList className="max-h-none">
                    <CommandGroup heading={resultsHeading}>
                      {results.map(item => (
                        <CommandItem
                          key={item.id}
                          value={`${item.name} ${item.description ?? ""}`}
                          onSelect={() => handleResultSelect(item)}
                          className="items-start rounded-xl px-3 py-3"
                        >
                          <SearchResultRow item={item} />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                ) : (
                  <Empty className="border-0 px-6 py-12">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Search className="size-5" />
                      </EmptyMedia>
                      <EmptyTitle>Sin resultados</EmptyTitle>
                      <EmptyDescription>
                        Intenta con otro nombre o una palabra de la descripción.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )}
              </ScrollArea>
            </Command>
          </div>
        </DrawerContent>
      </Drawer>

      {selectedItem && (
        <ItemDetail
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </>
  )
}

function SearchResultRow({ item }: { item: PublicMenuSearchItem }) {
  const firstVariant = item.variants[0]
  const pricePreview = firstVariant
    ? formatPrice(
        firstVariant.price,
        resolveCurrency(item.currency ?? undefined)
      )
    : null

  return (
    <div className="flex w-full items-start gap-3">
      <div
        className={cn(
          `bg-muted flex size-14 shrink-0 items-center justify-center rounded-xl
          border bg-cover bg-center`,
          !item.image && "bg-[url('/bg/leaf.svg')]"
        )}
        style={
          item.image
            ? {
                backgroundImage: `url(${item.image})`
              }
            : undefined
        }
      />

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-medium">{item.name}</p>
            <p className="text-muted-foreground line-clamp-2 text-xs">
              {item.description || "Sin descripción disponible"}
            </p>
          </div>

          {item.categoryName && (
            <Badge variant="secondary" className="shrink-0">
              {item.categoryName}
            </Badge>
          )}
        </div>

        {pricePreview && (
          <p className="text-muted-foreground text-xs">
            {item.variants.length > 1 ? `Desde ${pricePreview}` : pricePreview}
          </p>
        )}
      </div>
    </div>
  )
}
