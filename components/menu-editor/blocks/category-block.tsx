import { useNode } from "@craftjs/core"
import type { Prisma } from "@prisma/client"
import Image from "next/image"

import type { getCategoriesWithItems } from "@/server/actions/item/queries"
import { cn } from "@/lib/utils"

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
      className="px-4"
    >
      <h2 className="text-lg font-bold leading-10">{data.name}</h2>
      <div className="space-y-4">
        {data.menuItems.map(item => {
          const hasVariants = item.variants.length > 1
          return (
            <div key={item.id}>
              <div
                className={cn(
                  "flex flex-row justify-between",
                  hasVariants ? "items-start" : "items-center"
                )}
              >
                <div className="flex flex-row gap-2">
                  {item.image && (
                    <Image
                      src={item.image}
                      width={128}
                      height={96}
                      alt={item.name}
                      layout="fixed"
                      className="h-16 w-20 rounded object-cover"
                      unoptimized
                    ></Image>
                  )}
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <span className="line-clamp-3 text-sm">
                      {item.description}
                    </span>
                  </div>
                </div>
                {item.variants.length > 1 ? (
                  <div className="flex flex-row justify-end">
                    <div className="grid grid-cols-2 gap-1 text-right">
                      {item.variants.map(variant => (
                        <>
                          <span key={variant.id} className="text-sm">
                            {variant.name}
                          </span>
                          <span
                            key={variant.id}
                            className="text-sm font-medium"
                          >
                            {variant.price}
                          </span>
                        </>
                      ))}
                    </div>
                  </div>
                ) : (
                  <span className="text-sm font-medium">
                    {item.variants[0]?.price}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

CategoryBlock.craft = {
  displayName: "Categoría"
}
