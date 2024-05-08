import { useNode } from "@craftjs/core"

import type { HeaderBlockProps } from "@/components/menu-editor/blocks/header-block"
import SideSection from "@/components/menu-editor/side-section"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export default function HeaderSettings() {
  const {
    actions: { setProp },
    showBanner,
    showLogo,
    showAddress,
    showSocialMedia
  } = useNode(node => ({
    accentColor: node.data.props.accentColor,
    showBanner: node.data.props.showBanner,
    showLogo: node.data.props.showLogo,
    showAddress: node.data.props.showAddress,
    showSocialMedia: node.data.props.showSocialMedia
  }))
  return (
    <>
      <SideSection title="Imágenes">
        <div className="grid grid-cols-2 items-center gap-y-2">
          <dt>
            <Label size="sm">Logo</Label>
          </dt>
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
          <dt>
            <Label size="sm">Portada</Label>
          </dt>
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
      <SideSection title="Negocio">
        <div className="grid grid-cols-2 items-center gap-y-2">
          <dt>
            <Label size="sm">Dirección</Label>
          </dt>
          <dd className="flex items-center">
            <Switch
              className="scale-75"
              checked={showAddress}
              onCheckedChange={checked => {
                setProp(
                  (props: Required<HeaderBlockProps>) =>
                    (props.showAddress = checked)
                )
              }}
            />
          </dd>
          <dt>
            <Label size="sm">Redes sociales</Label>
          </dt>
          <dd className="flex items-center">
            <Switch
              className="scale-75"
              checked={showSocialMedia}
              onCheckedChange={checked => {
                setProp(
                  (props: Required<HeaderBlockProps>) =>
                    (props.showSocialMedia = checked)
                )
              }}
            />
          </dd>
        </div>
      </SideSection>
    </>
  )
}
