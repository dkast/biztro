import { useNode } from "@craftjs/core"

import InfoHelper from "@/components/dashboard/info-helper"
import type { FeaturedBlockProps } from "@/components/menu-editor/blocks/featured-block"
import { EditorSettingRow } from "@/components/menu-editor/settings/editor-setting-row"
import SideSection from "@/components/menu-editor/side-section"
import { Switch } from "@/components/ui/switch"

export default function FeaturedSettings() {
  const {
    actions: { setProp },
    autoPlay
  } = useNode(node => ({
    autoPlay: node.data.props.autoPlay
  }))

  return (
    <SideSection title="General">
      <EditorSettingRow
        label="Auto play"
        hint={
          <InfoHelper>
            Activa la auto reproducción para que los elementos destacados
            cambien automáticamente hasta que el usuario interactúe con ellos.
          </InfoHelper>
        }
      >
        <Switch
          className="sm:scale-75"
          aria-label="Auto play"
          checked={autoPlay}
          onCheckedChange={checked => {
            setProp((props: FeaturedBlockProps) => (props.autoPlay = checked))
          }}
        />
      </EditorSettingRow>
    </SideSection>
  )
}
