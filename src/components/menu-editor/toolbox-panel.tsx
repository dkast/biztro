"use client"

import { useEffect } from "react"
import { useEditor } from "@craftjs/core"
import type { Organization, Prisma } from "@prisma/client"
import { useQuery } from "@tanstack/react-query"
import { hexToRgba } from "@uiw/react-color"
import { useAtomValue } from "jotai"
import { Layers, PanelTop, Text, Type, type LucideIcon } from "lucide-react"
import Link from "next/link"

import CategoryBlock from "@/components/menu-editor/blocks/category-block"
import HeaderBlock from "@/components/menu-editor/blocks/header-block"
import HeadingElement from "@/components/menu-editor/blocks/heading-element"
import TextElement from "@/components/menu-editor/blocks/text-element"
import SideSection from "@/components/menu-editor/side-section"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import type { getCategoriesWithItems } from "@/server/actions/item/queries"
import type { getDefaultLocation } from "@/server/actions/location/queries"
import { getThemes } from "@/server/actions/menu/queries"
import { colorThemeAtom, fontThemeAtom } from "@/lib/atoms"
import { colorThemes, fontThemes } from "@/lib/types"

export default function ToolboxPanel({
  organization,
  location,
  categories
}: {
  organization: Organization
  location: Prisma.PromiseReturnType<typeof getDefaultLocation> | null
  categories: Prisma.PromiseReturnType<typeof getCategoriesWithItems>
}) {
  const { connectors } = useEditor()
  const fontThemeId = useAtomValue(fontThemeAtom)
  const colorThemeId = useAtomValue(colorThemeAtom)

  const { data: userColorThemes } = useQuery({
    queryKey: ["themes"],
    queryFn: () => getThemes({ themeType: "COLOR" })
  })

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
  }, [userColorThemes])

  const selectedFontTheme = fontThemes.find(theme => theme.name === fontThemeId)
  const selectedColorTheme = colorThemes.find(
    theme => theme.id === colorThemeId
  )

  if (!selectedFontTheme || !selectedColorTheme)
    return (
      <Alert variant="destructive" className="m-2 w-auto text-sm">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          No se pudo encontrar el tema de fuente o color seleccionado.
        </AlertDescription>
      </Alert>
    )

  return (
    <>
      <SideSection title="Categorías y Productos" className="editor-categories">
        {categories.length > 0 ? (
          categories.map(category => (
            <div
              key={category.id}
              ref={ref => {
                if (ref) {
                  connectors.create(
                    ref,
                    <CategoryBlock
                      data={category}
                      categoryFontFamily={selectedFontTheme.fontDisplay}
                      itemFontFamily={selectedFontTheme.fontDisplay}
                      priceFontFamily={selectedFontTheme.fontText}
                      descriptionFontFamily={selectedFontTheme.fontText}
                      categoryColor={hexToRgba(selectedColorTheme.accentColor)}
                      itemColor={hexToRgba(selectedColorTheme.textColor)}
                      priceColor={hexToRgba(selectedColorTheme.brandColor)}
                      descriptionColor={hexToRgba(
                        selectedColorTheme.mutedColor
                      )}
                    />
                  )
                }
              }}
            >
              <ToolboxElement title={category.name} Icon={Layers} />
            </div>
          ))
        ) : (
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
        )}
      </SideSection>
      <SideSection title="Elementos" className="editor-elements">
        <div
          ref={ref => {
            if (ref) {
              connectors.create(
                ref,
                <HeaderBlock
                  organization={organization}
                  location={location ?? undefined}
                  accentColor={hexToRgba(selectedColorTheme.brandColor)}
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
          <ToolboxElement title="Texto" Icon={Text} />
        </div>
      </SideSection>
    </>
  )
}

function ToolboxElement({ title, Icon }: { title: string; Icon: LucideIcon }) {
  return (
    <div className="group flex cursor-move items-center gap-2 rounded-lg border p-2 text-sm shadow-sm hover:border-lime-400 hover:ring-1 hover:ring-lime-100 dark:border-gray-700 dark:hover:border-green-600 dark:hover:ring-green-900">
      <Icon className="size-3.5 text-gray-400 group-hover:text-current" />
      <span>{title}</span>
    </div>
  )
}
