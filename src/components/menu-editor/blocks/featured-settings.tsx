import { useNode } from "@craftjs/core"

import InfoHelper from "@/components/dashboard/info-helper"
import type { FeaturedBlockProps } from "@/components/menu-editor/blocks/featured-block"
import SideSection from "@/components/menu-editor/side-section"
import { Label } from "@/components/ui/label"
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
      <div className="grid grid-cols-3 items-center gap-y-2">
        <dt className="col-span-2 flex items-start">
          <Label size="xs">Auto play</Label>
          <InfoHelper>
            Activa la auto reproducción para que los elementos destacados
            cambien automáticamente hasta que el usuario interactúe con ellos.
          </InfoHelper>
        </dt>
        <dd className="flex items-center">
          <Switch
            className="sm:scale-75"
            checked={autoPlay}
            onCheckedChange={checked => {
              setProp((props: FeaturedBlockProps) => (props.autoPlay = checked))
            }}
          />
        </dd>
      </div>
    </SideSection>
  )
}
