"use client"

import { useEditor } from "@craftjs/core"
import type { Organization, Prisma } from "@prisma/client"
import { hexToRgba } from "@uiw/react-color"
import { useAtomValue } from "jotai"
import { Layers, PanelTop, Text, Type, type LucideIcon } from "lucide-react"

import CategoryBlock from "@/components/menu-editor/blocks/category-block"
import HeaderBlock from "@/components/menu-editor/blocks/header-block"
import HeadingElement from "@/components/menu-editor/blocks/heading-element"
import TextElement from "@/components/menu-editor/blocks/text-element"
import SideSection from "@/components/menu-editor/side-section"
import type { getCategoriesWithItems } from "@/server/actions/item/queries"
import { colorThemeAtom, fontThemeAtom } from "@/lib/atoms"
import { colorThemes, fontThemes } from "@/lib/types"

export default function ToolboxPanel({
  organization,
  categories
}: {
  organization: Organization
  categories: Prisma.PromiseReturnType<typeof getCategoriesWithItems>
}) {
  const { connectors } = useEditor()
  const fontThemeId = useAtomValue(fontThemeAtom)
  const colorThemeId = useAtomValue(colorThemeAtom)

  const selectedFontTheme = fontThemes.find(theme => theme.name === fontThemeId)
  const selectedColorTheme = colorThemes.find(
    theme => theme.name === colorThemeId
  )

  if (!selectedFontTheme || !selectedColorTheme) return null

  return (
    <>
      <SideSection title="Categorías">
        {categories.map(category => (
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
                    descriptionColor={hexToRgba(selectedColorTheme.mutedColor)}
                  />
                )
              }
            }}
          >
            <ToolboxElement title={category.name} Icon={Layers} />
          </div>
        ))}
      </SideSection>
      <SideSection title="Elementos">
        <div
          ref={ref => {
            if (ref) {
              connectors.create(
                ref,
                <HeaderBlock
                  organization={organization}
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
    <div className="group flex cursor-move items-center gap-2 rounded-lg border p-2 text-sm shadow-sm hover:border-violet-500 ">
      <Icon className="size-3.5 text-gray-400 group-hover:text-current" />
      <span>{title}</span>
    </div>
  )
}
