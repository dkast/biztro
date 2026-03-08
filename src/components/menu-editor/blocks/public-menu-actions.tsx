"use client"

import * as React from "react"
import toast from "react-hot-toast"
import { Menu } from "bloom-menu"
import Fuse, { type IFuseOptions } from "fuse.js"
import { MoreHorizontal, Search, Share } from "lucide-react"
import Image from "next/image"

import {
  ItemDetail,
  type DetailItem
} from "@/components/menu-editor/blocks/item-detail"
import { usePublicMenu } from "@/components/menu-editor/public-menu-context"
import { Button } from "@/components/ui/button"
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from "@/components/ui/input-group"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle
} from "@/components/ui/item"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatPrice, resolveCurrency } from "@/lib/currency"
import type { PublicMenuSearchItem } from "@/lib/menu-search"

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
    : []

  React.useEffect(() => {
    if (!isSearchOpen && pendingItem) {
      setSelectedItem(pendingItem)
      setPendingItem(null)
    }
  }, [isSearchOpen, pendingItem])

  if (!publicMenu) {
    return null
  }

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
          if (!open) setQuery("")
        }}
      >
        <DrawerContent className="flex h-[82vh] flex-col">
          <DrawerHeader className="pb-8">
            <DrawerTitle>Buscar productos</DrawerTitle>
            <DrawerDescription>
              Busca coincidencias por nombre o descripción.
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex min-h-0 flex-1 flex-col gap-4 pb-4">
            <div className="px-4">
              <InputGroup>
                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
                <InputGroupInput
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Tacos, picante, vegetariano..."
                  autoFocus
                />
              </InputGroup>
            </div>

            <ScrollArea className="min-h-0 flex-1">
              {!deferredQuery ? null : results.length ? (
                <ItemGroup className="gap-0.5">
                  {results.map(item => (
                    <SearchResultRow
                      key={item.id}
                      item={item}
                      onSelect={() => handleResultSelect(item)}
                    />
                  ))}
                </ItemGroup>
              ) : (
                <Empty className="border-0 px-6 py-12">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Search />
                    </EmptyMedia>
                    <EmptyTitle>Sin resultados</EmptyTitle>
                    <EmptyDescription>
                      Intenta con otro nombre o una palabra de la descripción.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </ScrollArea>
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

function SearchResultRow({
  item,
  onSelect
}: {
  item: PublicMenuSearchItem
  onSelect: () => void
}) {
  const firstVariant = item.variants[0]
  const pricePreview = firstVariant
    ? formatPrice(
        firstVariant.price,
        resolveCurrency(item.currency ?? undefined)
      )
    : null

  return (
    <Item
      role="button"
      tabIndex={0}
      size="sm"
      className="cursor-pointer"
      onClick={onSelect}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onSelect()
        }
      }}
    >
      <ItemMedia
        variant="image"
        className="size-12 rounded-lg inset-ring inset-ring-black/10
          dark:inset-ring-white/10"
      >
        <Image
          src={item.image ?? "/bg/leaf.svg"}
          alt={item.name}
          width={48}
          height={48}
          className="size-full object-cover"
          unoptimized
        />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{item.name}</ItemTitle>
        {item.description && (
          <ItemDescription className="line-clamp-1">
            {item.description}
          </ItemDescription>
        )}
        {pricePreview && (
          <p className="text-muted-foreground text-xs">
            {item.variants.length > 1 ? `Desde ${pricePreview}` : pricePreview}
          </p>
        )}
      </ItemContent>
    </Item>
  )
}
