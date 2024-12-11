import { useNode } from "@craftjs/core"

import type { FeaturedBlockProps } from "@/components/menu-editor/blocks/featured-block"
import SideSection from "@/components/menu-editor/side-section"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { FONT_SIZES } from "@/lib/types"

export default function FeaturedSettings() {
  const {
    actions: { setProp },
    backgroundMode,
    itemFontSize,
    itemFontWeight,
    priceFontSize,
    priceFontWeight,
    showImage
  } = useNode(node => ({
    backgroundMode: node.data.props.backgroundMode,
    itemFontSize: node.data.props.itemFontSize,
    itemFontWeight: node.data.props.itemFontWeight,
    priceFontSize: node.data.props.priceFontSize,
    priceFontWeight: node.data.props.priceFontWeight,
    showImage: node.data.props.showImage
  }))

  return (
    <>
      <SideSection title="General">
        <div className="grid grid-cols-3 items-center gap-2">
          <dt>
            <Label size="sm">Fondo</Label>
          </dt>
          <dd className="col-span-2 flex items-center">
            <Select
              value={backgroundMode}
              onValueChange={value =>
                setProp(
                  (props: FeaturedBlockProps) =>
                    (props.backgroundMode = value as "dark" | "light" | "none")
                )
              }
            >
              <SelectTrigger className="h-7 text-xs focus:ring-transparent">
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Ninguno</SelectItem>
                <SelectItem value="light">Claro</SelectItem>
                <SelectItem value="dark">Oscuro</SelectItem>
              </SelectContent>
            </Select>
          </dd>
        </div>
      </SideSection>
      <SideSection title="Producto">
        {/* Reuse similar settings structure from item-settings.tsx */}
        <div className="grid grid-cols-3 items-center gap-2">
          <dt>
            <Label size="sm">Tamaño</Label>
          </dt>
          <dd className="col-span-2 flex items-center">
            <Select
              value={itemFontSize.toString()}
              onValueChange={value =>
                setProp(
                  (props: FeaturedBlockProps) =>
                    (props.itemFontSize = parseInt(value))
                )
              }
            >
              <SelectTrigger className="h-7 text-xs focus:ring-transparent">
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
          {/* ...Rest of product settings... */}
        </div>
      </SideSection>
      <SideSection title="Imágen Producto">
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
                  (props: FeaturedBlockProps) => (props.showImage = checked)
                )
              }}
            />
          </dd>
        </div>
      </SideSection>
    </>
  )
}
