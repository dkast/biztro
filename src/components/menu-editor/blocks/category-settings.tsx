import { useEditor, useNode } from "@craftjs/core"
import { Colorful, hexToHsva, Sketch } from "@uiw/react-color"
import { useAtomValue } from "jotai"
import { AlignCenter, AlignLeft, AlignRight, Paintbrush } from "lucide-react"

import {
  type CategoryBlockProps,
  type CategoryHeadingShape
} from "@/components/menu-editor/blocks/category-block"
import SideSection from "@/components/menu-editor/side-section"
import { Button } from "@/components/ui/button"
import {
  DrawerContent,
  DrawerHeader,
  DrawerNested,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile"
import { colorListAtom, colorThemeAtom } from "@/lib/atoms"
import { FONT_SIZES } from "@/lib/types/theme"

// Helper to normalize color value (handles both hex string and legacy RgbaColor object)
function normalizeColor(
  color: string | { r: number; g: number; b: number; a?: number } | undefined,
  fallback: string
): string {
  if (!color) return fallback
  if (typeof color === "string") return color
  // Legacy RgbaColor object format
  const { r, g, b } = color
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, "0")).join("")}`
}

// Helper to get button style with "no color" indicator
function getColorButtonStyle(
  color: string | { r: number; g: number; b: number; a?: number } | undefined
): React.CSSProperties {
  const normalizedColor =
    color &&
    (typeof color === "string"
      ? color
      : `#${[color.r, color.g, color.b].map(x => x.toString(16).padStart(2, "0")).join("")}`)

  if (!normalizedColor) {
    return {
      backgroundImage: `
        linear-gradient(45deg, var(--muted) 25%, transparent 25%),
        linear-gradient(-45deg, var(--muted) 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, var(--muted) 75%),
        linear-gradient(-45deg, transparent 75%, var(--muted) 75%)
      `,
      backgroundSize: "12px 12px",
      backgroundPosition: "0 0, 0 6px, 6px -6px, -6px 0px",
      backgroundColor: "var(--border)"
    }
  }

  return { backgroundColor: normalizedColor }
}

type ColorPickerControlProps = {
  color: string | { r: number; g: number; b: number; a?: number } | undefined
  fallbackColor: string
  title: string
  ariaLabel: string
  clearLabel: string
  colorPresets: { color: string; title: string }[]
  isMobile: boolean
  onChange: (color: string) => void
  onClear: () => void
}

function ColorPickerControl({
  color,
  fallbackColor,
  title,
  ariaLabel,
  clearLabel,
  colorPresets,
  isMobile,
  onChange,
  onClear
}: ColorPickerControlProps) {
  if (isMobile) {
    return (
      <DrawerNested>
        <DrawerTrigger asChild>
          <button
            type="button"
            className="h-8 w-12 rounded-sm border border-black/20
              dark:border-white/20"
            style={getColorButtonStyle(color)}
            aria-label={ariaLabel}
          />
        </DrawerTrigger>
        <DrawerContent className="px-4 pb-8">
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          <div className="space-y-4">
            <div
              className="flex items-center justify-center"
              data-vaul-no-drag
              onPointerDown={event => event.stopPropagation()}
              onTouchStart={event => event.stopPropagation()}
              onMouseDown={event => event.stopPropagation()}
            >
              <Colorful
                disableAlpha
                color={normalizeColor(color, fallbackColor)}
                onChange={selectedColor => onChange(selectedColor.hex)}
              />
            </div>
            <Button
              variant="outline"
              className="w-full py-2 text-sm"
              onClick={onClear}
            >
              {clearLabel}
            </Button>
          </div>
        </DrawerContent>
      </DrawerNested>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="h-6 w-10 rounded-sm border border-black/20
            dark:border-white/20"
          style={getColorButtonStyle(color)}
          aria-label={ariaLabel}
        />
      </PopoverTrigger>
      <PopoverContent className="w-54.5 p-0">
        <div className="flex flex-col">
          <Sketch
            disableAlpha
            presetColors={colorPresets}
            color={hexToHsva(normalizeColor(color, fallbackColor))}
            onChange={selectedColor => onChange(selectedColor.hex)}
          />
          <button
            type="button"
            className="w-full border-t border-black/10 py-2 text-sm
              hover:bg-gray-50 dark:border-white/10 dark:hover:bg-gray-800"
            onClick={onClear}
          >
            {clearLabel}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default function CategorySettings() {
  const {
    id,
    actions: { setProp },
    categoryFontSize,
    categoryFontWeight,
    categoryTextAlign,
    categoryTextTransform,
    categoryHeadingBgColor,
    categoryHeadingShape,
    itemFontSize,
    itemFontWeight,
    itemTextTransform,
    priceFontSize,
    priceFontWeight,
    showImage
  } = useNode(node => ({
    categoryFontSize: node.data.props.categoryFontSize,
    categoryColor: node.data.props.categoryColor,
    categoryFontWeight: node.data.props.categoryFontWeight,
    categoryTextAlign: node.data.props.categoryTextAlign,
    categoryTextTransform: node.data.props.categoryTextTransform,
    categoryHeadingBgColor: node.data.props.categoryHeadingBgColor,
    categoryHeadingShape: node.data.props.categoryHeadingShape,
    itemFontSize: node.data.props.itemFontSize,
    itemColor: node.data.props.itemColor,
    itemFontWeight: node.data.props.itemFontWeight,
    itemTextTransform: node.data.props.itemTextTransform,
    priceFontSize: node.data.props.priceFontSize,
    priceColor: node.data.props.priceColor,
    priceFontWeight: node.data.props.priceFontWeight,
    showImage: node.data.props.showImage
  }))

  const { actions: editorActions, nodes } = useEditor(state => ({
    nodes: state.nodes
  }))

  const applyToAll = () => {
    const styleProps = {
      categoryFontSize,
      categoryFontWeight,
      categoryTextAlign,
      categoryTextTransform: categoryTextTransform ?? "none",
      categoryHeadingBgColor,
      categoryHeadingShape,
      itemFontSize,
      itemFontWeight,
      itemTextTransform: itemTextTransform ?? "none",
      priceFontSize,
      priceFontWeight,
      showImage
    }
    for (const [key, value] of Object.entries(nodes)) {
      if (key === id) continue
      if (value.data?.name === "CategoryBlock") {
        editorActions.history.ignore().setProp(key, props => {
          Object.assign(props, styleProps)
        })
      }
    }
  }

  const isMobile = useIsMobile()
  const colorList = useAtomValue(colorListAtom)
  const colorThemeId = useAtomValue(colorThemeAtom)

  const defaultTheme = {
    id: "DEFAULT",
    name: "Default",
    surfaceColor: "#ffffff",
    brandColor: "#131313",
    accentColor: "#424242",
    textColor: "#131313",
    mutedColor: "#636363",
    scope: "GLOBAL" as const
  } as const

  const selectedTheme = (colorList.find(theme => theme.id === colorThemeId) ??
    defaultTheme) as typeof defaultTheme

  const colorPresets = [
    { color: selectedTheme.surfaceColor, title: "Fondo" },
    { color: selectedTheme.brandColor, title: "Marca" },
    { color: selectedTheme.accentColor, title: "Acento" },
    { color: selectedTheme.textColor, title: "Texto" },
    { color: selectedTheme.mutedColor, title: "Tenue" }
  ]

  return (
    <>
      <SideSection title="Categoría">
        <div className="grid grid-cols-3 items-center gap-2">
          <dt>
            <Label size="xs">Tamaño</Label>
          </dt>
          <dd className="col-span-2 flex items-center">
            <Select
              value={categoryFontSize.toString()}
              onValueChange={value =>
                setProp(
                  (props: CategoryBlockProps) =>
                    (props.categoryFontSize = parseInt(value))
                )
              }
            >
              <SelectTrigger
                className="focus:ring-transparent sm:h-7! sm:text-xs"
              >
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                {FONT_SIZES.map(size => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </dd>
          <dt>
            <Label size="xs">Estilo</Label>
          </dt>
          <dd className="col-span-2 flex items-center">
            <Select
              value={categoryFontWeight}
              onValueChange={value =>
                setProp(
                  (props: CategoryBlockProps) =>
                    (props.categoryFontWeight = value)
                )
              }
            >
              <SelectTrigger
                className="focus:ring-transparent sm:h-7! sm:text-xs"
              >
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="300">Light</SelectItem>
                <SelectItem value="400">Regular</SelectItem>
                <SelectItem value="500">Medium</SelectItem>
                <SelectItem value="700">Negrita</SelectItem>
              </SelectContent>
            </Select>
          </dd>
          <dt>
            <Label size="xs">Alineación</Label>
          </dt>
          <dd className="col-span-2">
            <Tabs
              value={categoryTextAlign}
              onValueChange={value =>
                setProp(
                  (props: CategoryBlockProps) =>
                    (props.categoryTextAlign = value)
                )
              }
            >
              <TabsList className="h-8 p-0.5">
                <TabsTrigger value="left">
                  <AlignLeft className="size-3.5" />
                </TabsTrigger>
                <TabsTrigger value="center">
                  <AlignCenter className="size-3.5" />
                </TabsTrigger>
                <TabsTrigger value="right">
                  <AlignRight className="size-3.5" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </dd>
          <dt>
            <Label size="xs">Capitalización</Label>
          </dt>
          <dd className="col-span-2 flex items-center">
            <Select
              value={categoryTextTransform ?? "none"}
              onValueChange={value =>
                setProp(
                  (props: CategoryBlockProps) =>
                    (props.categoryTextTransform =
                      value as CategoryBlockProps["categoryTextTransform"])
                )
              }
            >
              <SelectTrigger
                className="focus:ring-transparent sm:h-7! sm:text-xs"
              >
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Normal</SelectItem>
                <SelectItem value="uppercase">Mayúsculas</SelectItem>
              </SelectContent>
            </Select>
          </dd>
          <dt>
            <Label size="xs">Fondo título</Label>
          </dt>
          <dd className="col-span-2 flex items-center">
            <ColorPickerControl
              color={categoryHeadingBgColor}
              fallbackColor={selectedTheme.surfaceColor}
              title="Color de fondo"
              ariaLabel="Seleccionar color de fondo"
              clearLabel="Sin color"
              colorPresets={colorPresets}
              isMobile={isMobile}
              onChange={color =>
                setProp(
                  (props: CategoryBlockProps) =>
                    (props.categoryHeadingBgColor = color)
                )
              }
              onClear={() => {
                setProp(
                  (props: CategoryBlockProps) =>
                    (props.categoryHeadingBgColor = undefined)
                )
              }}
            />
          </dd>
          <dt>
            <Label size="xs">Forma título</Label>
          </dt>
          <dd className="col-span-2 flex items-center">
            <Select
              value={categoryHeadingShape ?? "none"}
              onValueChange={value =>
                setProp(
                  (props: CategoryBlockProps) =>
                    (props.categoryHeadingShape = value as CategoryHeadingShape)
                )
              }
            >
              <SelectTrigger
                className="focus:ring-transparent sm:h-7! sm:text-xs"
              >
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Ninguna</SelectItem>
                <SelectItem value="rectangle">Rectángulo</SelectItem>
                <SelectItem value="rounded">Redondeado</SelectItem>
                <SelectItem value="pill">Cápsula</SelectItem>
                <SelectItem value="slanted">Corte diagonal</SelectItem>
                <SelectItem value="parallelogram">Banda inclinada</SelectItem>
                <SelectItem value="chevron">Flecha</SelectItem>
                <SelectItem value="tab">Pestaña</SelectItem>
                <SelectItem value="scooped">Marco</SelectItem>
                <SelectItem value="ribbon">Listón</SelectItem>
              </SelectContent>
            </Select>
          </dd>
        </div>
      </SideSection>
      <SideSection title="Producto">
        <div className="grid grid-cols-3 items-center gap-2">
          <dt>
            <Label size="xs">Tamaño</Label>
          </dt>
          <dd className="col-span-2 flex items-center">
            <Select
              value={itemFontSize.toString()}
              onValueChange={value =>
                setProp(
                  (props: CategoryBlockProps) =>
                    (props.itemFontSize = parseInt(value))
                )
              }
            >
              <SelectTrigger
                className="focus:ring-transparent sm:h-7! sm:text-xs"
              >
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                {FONT_SIZES.map(size => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </dd>
          <dt>
            <Label size="xs">Estilo</Label>
          </dt>
          <dd className="col-span-2 flex items-center">
            <Select
              value={itemFontWeight}
              onValueChange={value =>
                setProp(
                  (props: CategoryBlockProps) => (props.itemFontWeight = value)
                )
              }
            >
              <SelectTrigger
                className="focus:ring-transparent sm:h-7! sm:text-xs"
              >
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="300">Light</SelectItem>
                <SelectItem value="400">Regular</SelectItem>
                <SelectItem value="500">Medium</SelectItem>
                <SelectItem value="700">Negrita</SelectItem>
              </SelectContent>
            </Select>
          </dd>
          <dt>
            <Label size="xs">Capitalización</Label>
          </dt>
          <dd className="col-span-2 flex items-center">
            <Select
              value={itemTextTransform ?? "none"}
              onValueChange={value =>
                setProp(
                  (props: CategoryBlockProps) =>
                    (props.itemTextTransform =
                      value as CategoryBlockProps["itemTextTransform"])
                )
              }
            >
              <SelectTrigger
                className="focus:ring-transparent sm:h-7! sm:text-xs"
              >
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Normal</SelectItem>
                <SelectItem value="uppercase">Mayúsculas</SelectItem>
              </SelectContent>
            </Select>
          </dd>
        </div>
      </SideSection>
      <SideSection title="Precio">
        <div className="grid grid-cols-3 items-center gap-2">
          <dt>
            <Label size="xs">Tamaño</Label>
          </dt>
          <dd className="col-span-2 flex items-center">
            <Select
              value={priceFontSize.toString()}
              onValueChange={value =>
                setProp(
                  (props: CategoryBlockProps) =>
                    (props.priceFontSize = parseInt(value))
                )
              }
            >
              <SelectTrigger
                className="focus:ring-transparent sm:h-7! sm:text-xs"
              >
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                {FONT_SIZES.map(size => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </dd>
          <dt>
            <Label size="xs">Estilo</Label>
          </dt>
          <dd className="col-span-2 flex items-center">
            <Select
              value={priceFontWeight}
              onValueChange={value =>
                setProp(
                  (props: CategoryBlockProps) => (props.priceFontWeight = value)
                )
              }
            >
              <SelectTrigger
                className="focus:ring-transparent sm:h-7! sm:text-xs"
              >
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="300">Light</SelectItem>
                <SelectItem value="400">Regular</SelectItem>
                <SelectItem value="500">Medium</SelectItem>
                <SelectItem value="700">Negrita</SelectItem>
              </SelectContent>
            </Select>
          </dd>
        </div>
      </SideSection>
      <SideSection title="Imágen Producto">
        <div className="grid grid-cols-3 items-center gap-y-2">
          <dt>
            <Label size="xs">Mostrar</Label>
          </dt>
          <dd className="col-span-2 flex items-center">
            <Switch
              className="sm:scale-75"
              checked={showImage}
              onCheckedChange={checked => {
                setProp(
                  (props: Required<CategoryBlockProps>) =>
                    (props.showImage = checked)
                )
              }}
            />
          </dd>
        </div>
      </SideSection>
      <div className="px-4 py-3">
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5 text-xs"
              onClick={applyToAll}
            >
              <Paintbrush className="size-3.5" />
              Aplicar a todos
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Propagar estas propiedades a todas las categorías</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </>
  )
}
