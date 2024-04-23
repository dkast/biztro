import { useNode } from "@craftjs/core"
import { rgbaToHsva, Sketch } from "@uiw/react-color"
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react"

import type { CategoryBlockProps } from "@/components/menu-editor/blocks/category-block"
import SideSection from "@/components/menu-editor/side-section"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FONT_SIZES } from "@/lib/types"

export default function CategorySettings() {
  const {
    actions: { setProp },
    categoryFontSize,
    categoryColor,
    categoryFontWeight,
    categoryFontFamily,
    categoryTextAlign,
    itemFontSize,
    itemColor,
    itemFontWeight,
    itemFontFamily,
    priceFontSize,
    priceColor,
    priceFontWeight,
    priceFontFamily,
    showImage
  } = useNode(node => ({
    categoryFontSize: node.data.props.categoryFontSize,
    categoryColor: node.data.props.categoryColor,
    categoryFontWeight: node.data.props.categoryFontWeight,
    categoryFontFamily: node.data.props.categoryFontFamily,
    categoryTextAlign: node.data.props.categoryTextAlign,
    itemFontSize: node.data.props.itemFontSize,
    itemColor: node.data.props.itemColor,
    itemFontWeight: node.data.props.itemFontWeight,
    itemFontFamily: node.data.props.itemFontFamily,
    priceFontSize: node.data.props.priceFontSize,
    priceColor: node.data.props.priceColor,
    priceFontWeight: node.data.props.priceFontWeight,
    priceFontFamily: node.data.props.priceFontFamily,
    showImage: node.data.props.showImage
  }))
  return (
    <ScrollArea className="h-[98%]">
      <SideSection title="Categoría">
        <div className="grid grid-cols-3 items-center gap-2">
          <dt>
            <Label size="sm">Tamaño</Label>
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
              <SelectTrigger className="h-7 text-xs focus:ring-0">
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
            <Label size="sm">Color</Label>
          </dt>
          <dd className="col-span-2 flex items-center">
            <Popover>
              <PopoverTrigger>
                <div
                  className="h-5 w-12 rounded border border-black/10"
                  style={{
                    backgroundColor: `rgb(${Object.values(categoryColor)})`
                  }}
                ></div>
              </PopoverTrigger>
              <PopoverContent className="border-0 p-0 shadow-none">
                <Sketch
                  disableAlpha
                  color={rgbaToHsva(categoryColor)}
                  onChange={color =>
                    setProp(
                      (props: CategoryBlockProps) =>
                        (props.categoryColor = color.rgba)
                    )
                  }
                />
              </PopoverContent>
            </Popover>
          </dd>
          <dt>
            <Label size="sm">Estilo</Label>
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
              <SelectTrigger className="h-7 text-xs focus:ring-0">
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="200">Light</SelectItem>
                <SelectItem value="400">Regular</SelectItem>
                <SelectItem value="500">Medium</SelectItem>
                <SelectItem value="600">Negrita</SelectItem>
              </SelectContent>
            </Select>
          </dd>
          <dt>
            <Label size="sm">Alineación</Label>
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
        </div>
      </SideSection>
      <SideSection title="Producto">
        <div className="grid grid-cols-3 items-center gap-2">
          <dt>
            <Label size="sm">Tamaño</Label>
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
              <SelectTrigger className="h-7 text-xs focus:ring-0">
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
            <Label size="sm">Color</Label>
          </dt>
          <dd className="col-span-2 flex items-center">
            <Popover>
              <PopoverTrigger>
                <div
                  className="h-5 w-12 rounded border border-black/10"
                  style={{
                    backgroundColor: `rgb(${Object.values(itemColor)})`
                  }}
                ></div>
              </PopoverTrigger>
              <PopoverContent className="border-0 p-0 shadow-none">
                <Sketch
                  disableAlpha
                  color={rgbaToHsva(itemColor)}
                  onChange={color =>
                    setProp(
                      (props: CategoryBlockProps) =>
                        (props.itemColor = color.rgba)
                    )
                  }
                />
              </PopoverContent>
            </Popover>
          </dd>
          <dt>
            <Label size="sm">Estilo</Label>
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
              <SelectTrigger className="h-7 text-xs focus:ring-0">
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="200">Light</SelectItem>
                <SelectItem value="400">Regular</SelectItem>
                <SelectItem value="500">Medium</SelectItem>
                <SelectItem value="600">Negrita</SelectItem>
              </SelectContent>
            </Select>
          </dd>
        </div>
      </SideSection>
      <SideSection title="Precio">
        <div className="grid grid-cols-3 items-center gap-2">
          <dt>
            <Label size="sm">Tamaño</Label>
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
              <SelectTrigger className="h-7 text-xs focus:ring-0">
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
            <Label size="sm">Color</Label>
          </dt>
          <dd className="col-span-2 flex items-center">
            <Popover>
              <PopoverTrigger>
                <div
                  className="h-5 w-12 rounded border border-black/10"
                  style={{
                    backgroundColor: `rgb(${Object.values(priceColor)})`
                  }}
                ></div>
              </PopoverTrigger>
              <PopoverContent className="border-0 p-0 shadow-none">
                <Sketch
                  disableAlpha
                  color={rgbaToHsva(priceColor)}
                  onChange={color =>
                    setProp(
                      (props: CategoryBlockProps) =>
                        (props.priceColor = color.rgba)
                    )
                  }
                />
              </PopoverContent>
            </Popover>
          </dd>
          <dt>
            <Label size="sm">Estilo</Label>
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
              <SelectTrigger className="h-7 text-xs focus:ring-0">
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="200">Light</SelectItem>
                <SelectItem value="400">Regular</SelectItem>
                <SelectItem value="500">Medium</SelectItem>
                <SelectItem value="600">Negrita</SelectItem>
              </SelectContent>
            </Select>
          </dd>
        </div>
      </SideSection>
      <SideSection title="Imágen">
        <div className="grid grid-cols-3 items-center gap-y-2">
          <dt>
            <Label size="sm">Mostrar</Label>
          </dt>
          <dd className="col-span-2 flex items-center">
            <Switch
              className="scale-75"
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
    </ScrollArea>
  )
}
