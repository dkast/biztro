import { useNode } from "@craftjs/core"

import type { ContainerBlockProps } from "@/components/menu-editor/blocks/container-block"
import SideSection from "@/components/menu-editor/side-section"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

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
              <SelectItem value="none">Sólido</SelectItem>
              <SelectItem value="noise">Textura</SelectItem>
              <SelectItem value="topography">Terreno</SelectItem>
              <SelectItem value="food">Snacks</SelectItem>
              <SelectItem value="clouds">Nubes</SelectItem>
              <SelectItem value="leaf">Hojas</SelectItem>
            </SelectContent>
          </Select>
        </dd>
      </div>
    </SideSection>
  )
}
