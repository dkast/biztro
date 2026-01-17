"use client"

import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { ROOT_NODE, useEditor } from "@craftjs/core"
import { useQuery } from "@tanstack/react-query"
import { hexToRgba } from "@uiw/react-color"
import { useAtomValue, useSetAtom } from "jotai"
import { GripVertical, Lock, PlusSquare, type LucideIcon } from "lucide-react"
import Link from "next/link"

import { TooltipHelper } from "@/components/dashboard/tooltip-helper"
import { menuBlockIconMeta } from "@/components/menu-editor/block-icons"
import CategoryBlock from "@/components/menu-editor/blocks/category-block"
import FeaturedBlock from "@/components/menu-editor/blocks/featured-block"
import HeaderBlock from "@/components/menu-editor/blocks/header-block"
import HeadingElement from "@/components/menu-editor/blocks/heading-element"
import ItemBlock from "@/components/menu-editor/blocks/item-block"
import NavigatorBlock from "@/components/menu-editor/blocks/navigator-block"
import TextElement from "@/components/menu-editor/blocks/text-element"
import SideSection from "@/components/menu-editor/side-section"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type {
  getCategoriesWithItems,
  getFeaturedItems,
  getMenuItemsWithoutCategory
} from "@/server/actions/item/queries"
import type { getDefaultLocation } from "@/server/actions/location/queries"
import { getThemes } from "@/server/actions/menu/queries"
import type { getCurrentOrganization } from "@/server/actions/user/queries"
import { colorListAtom, colorThemeAtom, fontThemeAtom } from "@/lib/atoms"
import { colorThemes, fontThemes } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function ToolboxPanel({
  organization,
  location,
  categories,
  soloItems,
  featuredItems,
  isPro // Add this prop
}: {
  organization: NonNullable<Awaited<ReturnType<typeof getCurrentOrganization>>>
  location: Awaited<ReturnType<typeof getDefaultLocation>> | null
  categories: Awaited<ReturnType<typeof getCategoriesWithItems>>
  soloItems: Awaited<ReturnType<typeof getMenuItemsWithoutCategory>>
  featuredItems: Awaited<ReturnType<typeof getFeaturedItems>>
  isPro: boolean
}) {
  const { connectors, actions, query } = useEditor()
  const fontThemeId = useAtomValue(fontThemeAtom)
  const colorThemeId = useAtomValue(colorThemeAtom)

  const { data: userColorThemes } = useQuery({
    queryKey: ["themes"],
    queryFn: () => getThemes({ themeType: "COLOR" })
  })

  // Save the colorThemes and userColorThemes in the atom state
  const setColorList = useSetAtom(colorListAtom)
  const [selectedColorTheme, setSelectedColorTheme] =
    useState<(typeof colorThemes)[0]>()
  const [selectedFontTheme, setSelectedFontTheme] =
    useState<(typeof fontThemes)[0]>()

  useEffect(() => {
    if (userColorThemes) {
      for (const theme of userColorThemes) {
        const parsedTheme = JSON.parse(theme.themeJSON)
        // If custom theme doesnt already exists, add it
        const customThemeIndex = colorThemes.findIndex(
          t => t.id === parsedTheme.id
        )
        if (customThemeIndex === -1) {
          // console.log("add theme", theme)
          colorThemes.push(parsedTheme)
        }
      }
    }
    setColorList(colorThemes)
  }, [userColorThemes, setColorList])

  useEffect(() => {
    setSelectedColorTheme(colorThemes.find(theme => theme.id === colorThemeId))
    setSelectedFontTheme(fontThemes.find(theme => theme.name === fontThemeId))
  }, [colorThemeId, fontThemeId])

  if (!selectedFontTheme || !selectedColorTheme) {
    return (
      <Alert variant="destructive" className="m-2 w-auto text-sm">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          No se pudo encontrar el tema de fuente o color seleccionado.
        </AlertDescription>
      </Alert>
    )
  }

  // Blocks
  const headerBlock = (
    <HeaderBlock
      layout="classic"
      organization={organization}
      location={location ?? undefined}
      accentColor={hexToRgba(selectedColorTheme.brandColor)}
      backgroundColor={hexToRgba(selectedColorTheme.surfaceColor)}
      fontFamily={selectedFontTheme.fontDisplay}
    />
  )

  const navBlock = (
    <NavigatorBlock color={hexToRgba(selectedColorTheme.brandColor)} />
  )

  const featuredBlock = (
    <FeaturedBlock
      items={featuredItems}
      backgroundColor={hexToRgba(selectedColorTheme.surfaceColor)}
      itemFontWeight="700"
      itemFontFamily={selectedFontTheme.fontText}
      priceFontWeight="500"
      priceFontFamily={selectedFontTheme.fontText}
      descriptionFontFamily={selectedFontTheme.fontText}
    />
  )

  const headingBlock = (
    <HeadingElement
      text="Encabezado"
      color={hexToRgba(selectedColorTheme.accentColor)}
      fontFamily={selectedFontTheme.fontDisplay}
    />
  )

  const textBlock = (
    <TextElement
      text="Texto"
      color={hexToRgba(selectedColorTheme.textColor)}
      fontFamily={selectedFontTheme.fontText}
    />
  )

  return (
    <>
      <SideSection title="Categorías y Productos" className="editor-categories">
        {categories.map(category => {
          const categoryBlock = (
            <CategoryBlock
              data={category}
              backgroundMode="none"
              categoryFontFamily={selectedFontTheme.fontDisplay}
              itemFontFamily={selectedFontTheme.fontDisplay}
              priceFontFamily={selectedFontTheme.fontText}
              descriptionFontFamily={selectedFontTheme.fontText}
              // categoryColor={hexToRgba(selectedColorTheme.accentColor)}
              categoryHeadingBgColor={selectedColorTheme.brandColor}
              itemColor={hexToRgba(selectedColorTheme.textColor)}
              priceColor={hexToRgba(selectedColorTheme.accentColor)}
              descriptionColor={hexToRgba(selectedColorTheme.mutedColor)}
            />
          )
          return (
            <div
              key={category.id}
              ref={ref => {
                if (ref) {
                  connectors.create(ref, categoryBlock)
                }
              }}
            >
              <ToolboxElement
                title={category.name}
                Icon={menuBlockIconMeta.category.icon}
                classNameIcon="text-orange-400"
                addButton={
                  <AddButton
                    onClick={() => {
                      const newNode = query
                        .parseReactElement(categoryBlock)
                        .toNodeTree()
                      actions.addNodeTree(newNode, ROOT_NODE)
                      toast.success("Categoría agregada")
                    }}
                  />
                }
              />
            </div>
          )
        })}

        {soloItems.map(item => {
          const itemBlock = (
            <ItemBlock
              item={item}
              backgroundMode="none"
              itemFontFamily={selectedFontTheme.fontDisplay}
              priceFontFamily={selectedFontTheme.fontText}
              descriptionFontFamily={selectedFontTheme.fontText}
              itemColor={hexToRgba(selectedColorTheme.textColor)}
              priceColor={hexToRgba(selectedColorTheme.accentColor)}
              descriptionColor={hexToRgba(selectedColorTheme.mutedColor)}
            />
          )
          return (
            <div
              key={item.id}
              ref={ref => {
                if (ref) {
                  connectors.create(ref, itemBlock)
                }
              }}
            >
              <ToolboxElement
                title={item.name}
                Icon={menuBlockIconMeta.item.icon}
                classNameIcon="text-purple-400"
                addButton={
                  <AddButton
                    onClick={() => {
                      const newNode = query
                        .parseReactElement(itemBlock)
                        .toNodeTree()
                      actions.addNodeTree(newNode, ROOT_NODE)
                      toast.success("Producto agregado")
                    }}
                  />
                }
              />
            </div>
          )
        })}

        {categories.length === 0 && soloItems.length === 0 ? (
          <Alert
            variant="information"
            className="mx-0.5 my-2 w-auto border-dashed text-sm"
          >
            <AlertTitle>Sin productos.</AlertTitle>
            <AlertDescription className="text-xs">
              Agrega productos y categorizalos para incluirlos en tu menú.
            </AlertDescription>
            <Link href="/dashboard/menu-items">
              <Button
                variant="outline"
                size="xs"
                className="dark:hover:bg-opacity-10 mt-2 w-full border-blue-500
                  bg-transparent text-blue-500 hover:bg-blue-50
                  hover:text-blue-900 dark:border-blue-400 dark:bg-transparent
                  dark:text-blue-400 dark:hover:bg-blue-900"
              >
                Ver productos
              </Button>
            </Link>
          </Alert>
        ) : null}
      </SideSection>
      <SideSection title="Elementos" className="editor-elements">
        <div
          ref={ref => {
            if (ref) {
              connectors.create(ref, headerBlock)
            }
          }}
        >
          <ToolboxElement
            title="Cabecera"
            Icon={menuBlockIconMeta.header.icon}
            addButton={
              <AddButton
                onClick={() => {
                  const newNode = query
                    .parseReactElement(headerBlock)
                    .toNodeTree()
                  actions.addNodeTree(newNode, ROOT_NODE)
                  toast.success("Cabecera agregada")
                }}
              />
            }
          />
        </div>
        <div
          ref={ref => {
            if (ref) {
              connectors.create(ref, navBlock)
            }
          }}
        >
          <ToolboxElement
            title="Navegación"
            Icon={menuBlockIconMeta.navigator.icon}
            addButton={
              <AddButton
                onClick={() => {
                  const newNode = query.parseReactElement(navBlock).toNodeTree()
                  actions.addNodeTree(newNode, ROOT_NODE)
                  toast.success("Navegación agregada")
                }}
              />
            }
          />
        </div>
        <ProOnlyWrapper enabled={isPro}>
          <div
            ref={ref => {
              if (ref && isPro) {
                connectors.create(ref, featuredBlock)
              }
            }}
          >
            <ToolboxElement
              title="Recomendados"
              Icon={menuBlockIconMeta.featured.icon}
              addButton={
                isPro && (
                  <AddButton
                    onClick={() => {
                      const newNode = query
                        .parseReactElement(featuredBlock)
                        .toNodeTree()
                      actions.addNodeTree(newNode, ROOT_NODE)
                      toast.success("Recomendados agregados")
                    }}
                  />
                )
              }
            />
          </div>
        </ProOnlyWrapper>
        <ProOnlyWrapper enabled={isPro}>
          <div
            ref={ref => {
              if (ref && isPro) {
                connectors.create(ref, headingBlock)
              }
            }}
          >
            <ToolboxElement
              title="Encabezado"
              Icon={menuBlockIconMeta.heading.icon}
              addButton={
                isPro && (
                  <AddButton
                    onClick={() => {
                      const newNode = query
                        .parseReactElement(headingBlock)
                        .toNodeTree()
                      actions.addNodeTree(newNode, ROOT_NODE)
                      toast.success("Encabezado agregado")
                    }}
                  />
                )
              }
            />
          </div>
        </ProOnlyWrapper>
        <ProOnlyWrapper enabled={isPro}>
          <div
            ref={ref => {
              if (ref && isPro) {
                connectors.create(ref, textBlock)
              }
            }}
          >
            <ToolboxElement
              title="Texto"
              Icon={menuBlockIconMeta.text.icon}
              addButton={
                isPro && (
                  <AddButton
                    onClick={() => {
                      const newNode = query
                        .parseReactElement(textBlock)
                        .toNodeTree()
                      actions.addNodeTree(newNode, ROOT_NODE)
                      toast.success("Texto agregado")
                    }}
                  />
                )
              }
            />
          </div>
        </ProOnlyWrapper>
      </SideSection>
    </>
  )
}

function ProOnlyWrapper({
  children,
  enabled
}: {
  children: React.ReactNode
  enabled: boolean
}) {
  if (enabled) return <>{children}</>

  return (
    <TooltipHelper content="Disponible en la versión Pro">
      <div className="relative cursor-not-allowed opacity-50">
        {children}
        <Badge
          className="absolute top-2 right-2 px-1 py-1 text-xs"
          variant="yellow"
        >
          <Lock className="size-3" />
        </Badge>
      </div>
    </TooltipHelper>
  )
}

function ToolboxElement({
  title,
  Icon,
  classNameIcon,
  addButton
}: {
  title: string
  Icon: LucideIcon
  classNameIcon?: string
  addButton?: React.ReactNode
}) {
  return (
    <div
      className="group flex cursor-move items-center justify-between gap-2
        rounded-sm bg-gray-100 p-4 hover:bg-gray-50 sm:p-2 sm:text-sm
        dark:bg-gray-800/50 dark:hover:bg-gray-800"
    >
      <div className="flex items-center gap-2">
        <Icon
          className={cn(
            "size-5 text-indigo-400 group-hover:text-current sm:size-3.5",
            classNameIcon
          )}
        />
        <span>{title}</span>
      </div>
      {addButton}
    </div>
  )
}

function AddButton({ onClick }: { onClick: () => void }) {
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-5 sm:hidden"
        onClick={onClick}
      >
        <PlusSquare className="size-5 text-green-500 dark:text-green-400" />
      </Button>

      <GripVertical
        className="hidden size-5 text-gray-400 sm:block dark:text-gray-600"
      />
    </>
  )
}
