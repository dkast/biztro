import React from "react"
import { useNode, UserComponent } from "@craftjs/core"
import Image from "next/image"

import { Item } from "@prisma/client"
import MenuItemSettings from "@/components/selectors/MenuItem/MenuItemSettings"

interface MenuItemProps {
  item: Item
  layout?: "default" | "image" | "center"
}

const MenuItem: UserComponent<MenuItemProps> = ({ item, layout }) => {
  const {
    connectors: { connect }
  } = useNode()
  return (
    <div ref={connect} className="flex flex-col px-4">
      <div className="flex flex-row items-center gap-2">
        <div className="flex items-center">
          {layout === "image" ? (
            <Image
              src={item.image}
              blurDataURL={item.imageBlurhash}
              width={128}
              height={96}
              alt={item.title}
              layout="fixed"
              className="h-24 w-32 rounded"
            ></Image>
          ) : null}
        </div>
        <div>
          {layout === "center" ? (
            <>
              <h3 className="text-center text-lg">{item.title}</h3>
              <div>
                <span className="text-center text-sm line-clamp-3">
                  {item.description}
                </span>
              </div>
              <div className="mt-1 text-center">
                <span>${item.price}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-row items-center justify-between">
                <h3 className="text-lg">{item.title}</h3>
                <span>${item.price}</span>
              </div>
              <div>
                <span className="text-sm line-clamp-3">{item.description}</span>
              </div>
              <div>
                <span className="text-xs italic">{item.extras}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

MenuItem.craft = {
  displayName: "Producto",
  props: {
    layout: "default"
  },
  related: {
    toolbar: MenuItemSettings
  }
}

export default MenuItem
