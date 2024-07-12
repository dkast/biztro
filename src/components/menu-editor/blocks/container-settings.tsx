import { useNode } from "@craftjs/core"

import type { ContainerBlockProps } from "@/components/menu-editor/blocks/container-block"
import SideSection from "@/components/menu-editor/side-section"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { BgImages } from "@/lib/types"

export default function ContainerSettings() {
  const {
    actions: { setProp },
    backgroundImage
  } = useNode(node => ({
    backgroundImage: node.data.props.backgroundImage
  }))
  return (
    <SideSection title="Sitio">
      <div className="grid grid-cols-3 items-center gap-2">
        <dt>
          <Label size="sm">Fondo</Label>
        </dt>
        <dd className="col-span-2 flex items-center">
          <Select
            value={backgroundImage}
            onValueChange={value =>
              setProp(
                (props: ContainerBlockProps) => (props.backgroundImage = value)
              )
            }
          >
            <SelectTrigger className="h-7 text-xs focus:ring-transparent">
              <SelectValue placeholder="Selecciona" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Patrones</SelectLabel>
                <SelectItem value="none">Sólido</SelectItem>
                <SelectItem value="noise.svg">Textura</SelectItem>
                <SelectItem value="topography.svg">Terreno</SelectItem>
                <SelectItem value="food.svg">Snacks</SelectItem>
                <SelectItem value="clouds.svg">Nubes</SelectItem>
                <SelectItem value="leaf.svg">Hojas</SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Imágenes</SelectLabel>
                {BgImages.map(image => (
                  <SelectItem key={image.image} value={image.image}>
                    {image.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </dd>
      </div>
    </SideSection>
  )
}
