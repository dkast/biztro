"use client"

import * as React from "react"
import { Menu } from "bloom-menu"
import Fuse, { type IFuseOptions } from "fuse.js"
import { Globe, Search } from "lucide-react"
import Image from "next/image"

import {
  ItemDetail,
  type DetailItem
} from "@/components/menu-editor/blocks/item-detail"
import { usePublicMenu } from "@/components/menu-editor/public-menu-context"
import { useTranslation } from "@/components/menu-editor/translation-provider"
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
import { LanguageFlag } from "@/components/ui/language-flag"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatPrice, resolveCurrency } from "@/lib/currency"
import type { PublicMenuSearchItem } from "@/lib/menu-search"
import { getUILabels } from "@/lib/ui-labels"
import { cn } from "@/lib/utils"

const bloomItemClassName =
  "text-foreground hover:bg-accent flex items-center rounded-lg gap-2 px-2 py-2 text-sm transition-colors"

const bloomMenuShellClassName =
  "border border-white/10 bg-background/75 shadow-xl backdrop-blur-xl dark:bg-background/75"

const floatingTriggerClassName =
  "border border-white/10 bg-background/70 hover:bg-background/90 shadow-lg ring-1 ring-black/10 backdrop-blur-md"

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
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = React.useState(false)
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [pendingItem, setPendingItem] = React.useState<DetailItem | null>(null)
  const [selectedItem, setSelectedItem] = React.useState<DetailItem | null>(
    null
  )
  const deferredQuery = React.useDeferredValue(query.trim())
  const translation = useTranslation()
  const t = translation?.t ?? getUILabels(null)
  const availableLocales = translation?.availableLocales ?? []

  const translatedItems = React.useMemo(() => {
    const items = publicMenu?.items ?? []

    return items.map(item => {
      const itemTranslation = translation?.getItemTranslation(item.id)

      return {
        ...item,
        name: itemTranslation?.name ?? item.name,
        description:
          itemTranslation?.description !== undefined
            ? itemTranslation.description
            : item.description,
        variants: item.variants.map(variant => ({
          ...variant,
          name:
            translation?.getVariantTranslation(variant.id)?.name ?? variant.name
        }))
      }
    })
  }, [publicMenu?.items, translation])

  const fuse = React.useMemo(
    () => new Fuse(translatedItems, fuseOptions),
    [translatedItems]
  )
  const results = React.useMemo(
    () =>
      deferredQuery
        ? fuse.search(deferredQuery).map(result => result.item)
        : [],
    [fuse, deferredQuery]
  )

  React.useEffect(() => {
    if (!isSearchOpen && pendingItem) {
      setSelectedItem(pendingItem)
      setPendingItem(null)
    }
  }, [isSearchOpen, pendingItem])

  if (!publicMenu) {
    return null
  }

  function handleSearchOpen() {
    setIsSearchOpen(true)
  }

  function handleLanguageSelect(locale: string | null) {
    translation?.setLocale(locale)
    setIsLanguageMenuOpen(false)
  }

  function handleResultSelect(item: DetailItem) {
    setPendingItem(item)
    setIsSearchOpen(false)
    setQuery("")
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {translation && availableLocales.length > 0 && (
          <Menu.Root
            open={isLanguageMenuOpen}
            onOpenChange={setIsLanguageMenuOpen}
            direction="bottom"
            anchor="end"
          >
            <Menu.Container
              buttonSize={40}
              menuWidth={160}
              menuRadius={12}
              className={bloomMenuShellClassName}
            >
              <Menu.Trigger>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className={`${floatingTriggerClassName} gap-1.5 rounded-full
                  px-3`}
                  aria-label={translation.locale ? "Cambiar idioma" : "Español"}
                >
                  {translation.locale ? (
                    <LanguageFlag
                      locale={translation.locale}
                      className="size-4"
                    />
                  ) : (
                    <Globe className="size-4" />
                  )}
                </Button>
              </Menu.Trigger>
              <Menu.Content className="w-fit p-2">
                <Menu.Item
                  className={cn(
                    bloomItemClassName,
                    !translation.locale && "bg-accent/70 text-foreground"
                  )}
                  onSelect={() => handleLanguageSelect(null)}
                >
                  Español (original)
                </Menu.Item>
                {availableLocales.map(locale => (
                  <Menu.Item
                    key={locale.code}
                    className={cn(
                      bloomItemClassName,
                      translation.locale === locale.code &&
                        "bg-accent/70 text-foreground"
                    )}
                    onSelect={() => handleLanguageSelect(locale.code)}
                  >
                    {locale.label}
                  </Menu.Item>
                ))}
              </Menu.Content>
            </Menu.Container>
          </Menu.Root>
        )}

        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          className={`${floatingTriggerClassName} size-10 rounded-full`}
          onClick={handleSearchOpen}
        >
          <Search className="size-4" />
          <span className="sr-only">{t("search")}</span>
        </Button>
      </div>

      <Drawer
        open={isSearchOpen}
        repositionInputs={false}
        onOpenChange={open => {
          setIsSearchOpen(open)
          if (!open) setQuery("")
        }}
      >
        <DrawerContent className="flex h-[92dvh] flex-col">
          <DrawerHeader className="pb-8">
            <DrawerTitle>{t("search_products")}</DrawerTitle>
            <DrawerDescription>{t("search_description")}</DrawerDescription>
          </DrawerHeader>

          <div className="flex min-h-0 flex-1 flex-col gap-4 pb-4">
            <div className="px-4">
              <InputGroup>
                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
                <InputGroupInput
                  name="search"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Tacos, picante, vegetariano..."
                  inputMode="search"
                  enterKeyHint="search"
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
                    <EmptyTitle>{t("no_results")}</EmptyTitle>
                    <EmptyDescription>
                      {t("no_results_description")}
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
  const translation = useTranslation()
  const t = translation?.t ?? getUILabels(null)

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
            {item.variants.length > 1
              ? `${t("from")} ${pricePreview}`
              : pricePreview}
          </p>
        )}
      </ItemContent>
    </Item>
  )
}
