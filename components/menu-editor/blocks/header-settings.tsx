import { useNode } from "@craftjs/core"
import { rgbaToHsva, Sketch } from "@uiw/react-color"

import type { HeaderBlockProps } from "@/components/menu-editor/blocks/header-block"
import SideSection from "@/components/menu-editor/side-section"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"

export default function HeaderSettings() {
  const {
    actions: { setProp },
    titleColor,
    showBanner,
    showLogo
  } = useNode(node => ({
    titleColor: node.data.props.titleColor,
    showBanner: node.data.props.showBanner,
    showLogo: node.data.props.showLogo
  }))
  return (
    <>
      <SideSection title="Título">
        <div className="grid grid-cols-2 items-center gap-y-2">
          <dt>Color</dt>
          <dd className="flex items-center">
            <Popover>
              <PopoverTrigger>
                <div
                  className="h-5 w-12 rounded border border-black/10"
                  style={{
                    backgroundColor: `rgb(${Object.values(titleColor)})`
                  }}
                ></div>
              </PopoverTrigger>
              <PopoverContent className="border-0 p-0 shadow-none">
                <Sketch
                  disableAlpha
                  color={rgbaToHsva(titleColor)}
                  onChange={color => {
                    setProp(
                      (props: Required<HeaderBlockProps>) =>
                        (props.titleColor = color.rgba)
                    )
                  }}
                />
              </PopoverContent>
            </Popover>
          </dd>
        </div>
      </SideSection>
      <SideSection title="Imágenes">
        <div className="grid grid-cols-2 items-center gap-y-2">
          <dt>Logo</dt>
          <dd className="flex items-center">
            <Switch
              className="scale-75"
              checked={showLogo}
              onCheckedChange={checked => {
                setProp(
                  (props: Required<HeaderBlockProps>) =>
                    (props.showLogo = checked)
                )
              }}
            />
          </dd>
          <dt>Portada</dt>
          <dd className="flex items-center">
            <Switch
              className="scale-75"
              checked={showBanner}
              onCheckedChange={checked => {
                setProp(
                  (props: Required<HeaderBlockProps>) =>
                    (props.showBanner = checked)
                )
              }}
            />
          </dd>
        </div>
      </SideSection>
    </>
  )
}
