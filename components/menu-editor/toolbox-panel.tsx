import { useEditor } from "@craftjs/core"
import type { Prisma } from "@prisma/client"
import { Diamond, Layers, Type, type LucideIcon } from "lucide-react"

import CategoryBlock from "@/components/menu-editor/blocks/category-block"
import TextElement from "@/components/menu-editor/blocks/text-element"
import SideSection from "@/components/menu-editor/side-section"
import type { getCategoriesWithItems } from "@/server/actions/item/queries"

export default function ToolboxPanel({
  categoryData
}: {
  categoryData: Prisma.PromiseReturnType<typeof getCategoriesWithItems>
}) {
  const { connectors } = useEditor()
  return (
    <>
      <SideSection title="Categorías">
        {categoryData.map(category => (
          <div
            key={category.id}
            ref={ref => {
              if (ref) {
                connectors.create(ref, <CategoryBlock data={category} />)
              }
            }}
          >
            <ToolboxElement title={category.name} Icon={Layers} />
          </div>
        ))}
      </SideSection>
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

function ToolboxComponent({
  title,
  Icon
}: {
  title: string
  Icon: LucideIcon
}) {
  return (
    <div className="group flex cursor-move items-center gap-2 rounded-lg border p-2 text-sm shadow-sm hover:border-violet-500 ">
      <Icon className="size-3.5 text-gray-400 group-hover:text-current" />
      <span>{title}</span>
    </div>
  )
}
