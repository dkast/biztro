import { useEditor } from "@craftjs/core"
import { Type, type LucideIcon } from "lucide-react"

import TextElement from "@/components/menu-editor/blocks/text-element"
import SideSection from "@/components/menu-editor/side-section"

export default function ToolboxPanel() {
  const { connectors } = useEditor()
  return (
    <>
      <SideSection title="Productos"></SideSection>
      <SideSection title="Elementos">
        <div
          ref={ref => {
            if (ref) {
              connectors.create(ref, <TextElement text="Texto" />)
            }
          }}
        >
          <ToolboxElement title="Texto" Icon={Type} />
        </div>
      </SideSection>
    </>
  )
}

function ToolboxElement({ title, Icon }: { title: string; Icon: LucideIcon }) {
  return (
    <div className="group flex cursor-move items-center gap-2 rounded-lg border p-2 text-sm shadow-sm hover:border-violet-500 ">
      <Icon className="size-3.5 text-gray-400 group-hover:text-current" />
      <span>{title}</span>
    </div>
  )
}
