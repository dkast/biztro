import { useNode } from "@craftjs/core"
import type { Prisma } from "@prisma/client"

import type { getCategoriesWithItems } from "@/server/actions/item/queries"

export type CategoryBlockProps = {
  data: Prisma.PromiseReturnType<typeof getCategoriesWithItems>[0]
}

export default function CategoryBlock({ data }: CategoryBlockProps) {
  const {
    connectors: { connect }
  } = useNode()
  return (
    <div
      ref={ref => {
        if (ref) {
          connect(ref)
        }
      }}
    >
      <h3>{data.name}</h3>
      {data.menuItems.map(item => (
        <div key={item.id}>
          <span>{item.name}</span>
        </div>
      ))}
    </div>
  )
}
