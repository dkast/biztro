import { useNode } from "@craftjs/core"
import { rgbaToHsva, Sketch } from "@uiw/react-color"

import type { ContainerBlockProps } from "@/components/menu-editor/blocks/container-block"
import SideSection from "@/components/menu-editor/side-section"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"

export default function ContainerSettings() {
  const {
    actions: { setProp },
    backgroundColor
  } = useNode(node => ({ backgroundColor: node.data.props.backgroundColor }))
  return (
    <SideSection title="Sitio">
      <div className="grid grid-cols-3 items-center gap-2">
        <dt>
          <Label>Fondo</Label>
        </dt>
        <dd className="col-span-2 flex items-center">
          <Popover>
            <PopoverTrigger>
              <div
                className="h-6 w-12 rounded border border-black/20"
                style={{
                  backgroundColor: `rgb(${Object.values(backgroundColor)})`
                }}
              ></div>
            </PopoverTrigger>
            <PopoverContent className="border-0 p-0 shadow-none">
              <Sketch
                disableAlpha
                color={rgbaToHsva(backgroundColor)}
                onChange={color => {
                  setProp(
                    (props: Required<ContainerBlockProps>) =>
                      (props.backgroundColor = color.rgba)
                  )
                }}
              />
            </PopoverContent>
          </Popover>
        </dd>
      </div>
    </SideSection>
  )
}
