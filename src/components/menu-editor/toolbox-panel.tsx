"use client"

import { useEffect, useState } from "react"
import { useEditor } from "@craftjs/core"
import type { Organization, Prisma } from "@prisma/client"
import { useQuery } from "@tanstack/react-query"
import { hexToRgba } from "@uiw/react-color"
import { useAtomValue } from "jotai"
import {
  Diamond,
  Layers,
  LetterText,
  LinkIcon,
  PanelTop,
  Type,
  type LucideIcon
} from "lucide-react"
import Link from "next/link"

import CategoryBlock from "@/components/menu-editor/blocks/category-block"
import HeaderBlock from "@/components/menu-editor/blocks/header-block"
import HeadingElement from "@/components/menu-editor/blocks/heading-element"
import ItemBlock from "@/components/menu-editor/blocks/item-block"
import NavigatorBlock from "@/components/menu-editor/blocks/navigator-block"
import TextElement from "@/components/menu-editor/blocks/text-element"
import SideSection from "@/components/menu-editor/side-section"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import type {
  getCategoriesWithItems,
  getMenuItemsWithoutCategory
} from "@/server/actions/item/queries"
import type { getDefaultLocation } from "@/server/actions/location/queries"
import { getThemes } from "@/server/actions/menu/queries"
import { colorThemeAtom, fontThemeAtom } from "@/lib/atoms"
import { colorThemes, fontThemes } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function ToolboxPanel({
  organization,
  location,
  categories,
  soloItems
}: {
  organization: Organization
  location: Prisma.PromiseReturnType<typeof getDefaultLocation> | null
  categories: Prisma.PromiseReturnType<typeof getCategoriesWithItems>
  soloItems: Prisma.PromiseReturnType<typeof getMenuItemsWithoutCategory>
}) {
  const { connectors } = useEditor()
  const fontThemeId = useAtomValue(fontThemeAtom)
  const colorThemeId = useAtomValue(colorThemeAtom)

  const { data: userColorThemes } = useQuery({
    queryKey: ["themes"],
    queryFn: () => getThemes({ themeType: "COLOR" })
  })

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
          console.log("add theme", theme)
          colorThemes.push(parsedTheme)
        }
      }
    }
    setSelectedColorTheme(colorThemes.find(theme => theme.id === colorThemeId))
    setSelectedFontTheme(fontThemes.find(theme => theme.name === fontThemeId))
  }, [colorThemeId, fontThemeId, userColorThemes])

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

  return (
    <>
      <SideSection title="Categorías y Productos" className="editor-categories">
        {categories.map(category => (
          <div
            key={category.id}
            ref={ref => {
              if (ref) {
                connectors.create(
                  ref,
                  <CategoryBlock
                    data={category}
                    backgroundMode="none"
                    categoryFontFamily={selectedFontTheme.fontDisplay}
                    itemFontFamily={selectedFontTheme.fontDisplay}
                    priceFontFamily={selectedFontTheme.fontText}
                    descriptionFontFamily={selectedFontTheme.fontText}
                    categoryColor={hexToRgba(selectedColorTheme.accentColor)}
                    itemColor={hexToRgba(selectedColorTheme.textColor)}
                    priceColor={hexToRgba(selectedColorTheme.accentColor)}
                    descriptionColor={hexToRgba(selectedColorTheme.mutedColor)}
                  />
                )
              }
            }}
          >
            <ToolboxElement
              title={category.name}
              Icon={Layers}
              classNameIcon="text-orange-400"
            />
          </div>
        ))}

        {soloItems.map(item => (
          <div
            key={item.id}
            ref={ref => {
              if (ref) {
                connectors.create(
                  ref,
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
              }
            }}
          >
            <ToolboxElement
              title={item.name}
              Icon={Diamond}
              classNameIcon="text-purple-400"
            />
          </div>
        ))}

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
                className="mt-2 w-full border-blue-500 bg-transparent text-blue-500 hover:bg-blue-50 hover:text-blue-900 dark:border-blue-400 dark:bg-transparent dark:text-blue-400 dark:hover:bg-blue-900 dark:hover:bg-opacity-10"
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
              connectors.create(
                ref,
                <HeaderBlock
                  layout="classic"
                  organization={organization}
                  location={location ?? undefined}
                  accentColor={hexToRgba(selectedColorTheme.brandColor)}
                  backgroundColor={hexToRgba(selectedColorTheme.surfaceColor)}
                  fontFamily={selectedFontTheme.fontDisplay}
                />
              )
            }
          }}
        >
          <ToolboxElement title="Cabecera" Icon={PanelTop} />
        </div>
        <div
          ref={ref => {
            if (ref) {
              connectors.create(ref, <NavigatorBlock ids={[]} />)
            }
          }}
        >
          <ToolboxElement title="Navegador" Icon={LinkIcon} />
        </div>
        <div
          ref={ref => {
            if (ref) {
              connectors.create(
                ref,
                <HeadingElement
                  text="Encabezado"
                  color={hexToRgba(selectedColorTheme.accentColor)}
                  fontFamily={selectedFontTheme.fontDisplay}
                />
              )
            }
          }}
        >
          <ToolboxElement title="Encabezado" Icon={Type} />
        </div>
        <div
          ref={ref => {
            if (ref) {
              connectors.create(
                ref,
                <TextElement
                  text="Texto"
                  color={hexToRgba(selectedColorTheme.textColor)}
                  fontFamily={selectedFontTheme.fontText}
                />
              )
            }
          }}
        >
          <ToolboxElement title="Texto" Icon={LetterText} />
        </div>
      </SideSection>
    </>
  )
}

function ToolboxElement({
  title,
  Icon,
  classNameIcon
}: {
  title: string
  Icon: LucideIcon
  classNameIcon?: string
}) {
  return (
    <div className="group flex cursor-move items-center gap-2 rounded-lg border p-2 text-sm shadow-sm hover:border-lime-400 hover:ring-1 hover:ring-lime-100 dark:border-gray-700 dark:hover:border-green-600 dark:hover:ring-green-900">
      <Icon
        className={cn(
          "size-3.5 text-blue-400 group-hover:text-current",
          classNameIcon
        )}
      />
      <span>{title}</span>
    </div>
  )
}
