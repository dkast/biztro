import { useNode } from "@craftjs/core"

import type { HeaderBlockProps } from "@/components/menu-editor/blocks/header-block"
import { EditorSettingRow } from "@/components/menu-editor/settings/editor-setting-row"
import SideSection from "@/components/menu-editor/side-section"
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
        <EditorSettingRow label="Logo">
          <Switch
            className="sm:scale-75"
            aria-label="Mostrar logo"
            checked={showLogo}
            onCheckedChange={checked => {
              setProp(
                (props: Required<HeaderBlockProps>) =>
                  (props.showLogo = checked)
              )
            }}
          />
        </EditorSettingRow>
        <EditorSettingRow label="Portada">
          <Switch
            className="sm:scale-75"
            aria-label="Mostrar portada"
            checked={showBanner}
            onCheckedChange={checked => {
              setProp(
                (props: Required<HeaderBlockProps>) =>
                  (props.showBanner = checked)
              )
            }}
          />
        </EditorSettingRow>
      </SideSection>
      <SideSection title="Negocio">
        <EditorSettingRow label="Datos del negocio">
          <Switch
            className="sm:scale-75"
            aria-label="Mostrar datos del negocio"
            checked={showAddress}
            onCheckedChange={checked => {
              setProp(
                (props: Required<HeaderBlockProps>) =>
                  (props.showAddress = checked)
              )
            }}
          />
        </EditorSettingRow>
        <EditorSettingRow label="Redes sociales">
          <Switch
            className="sm:scale-75"
            aria-label="Mostrar redes sociales"
            checked={showSocialMedia}
            onCheckedChange={checked => {
              setProp(
                (props: Required<HeaderBlockProps>) =>
                  (props.showSocialMedia = checked)
              )
            }}
          />
        </EditorSettingRow>
      </SideSection>
    </>
  )
}
