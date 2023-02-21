import { useNode, UserComponent } from "@craftjs/core"
import { Item } from "@prisma/client"
import Image from "next/image"
import React from "react"

import Font from "@/components/Font"
import MenuItemSettings from "@/components/selectors/MenuItem/MenuItemSettings"

interface MenuItemProps {
  item: Item
  layout?: "default" | "image" | "center"
  titleColor?: Record<"r" | "g" | "b" | "a", number>
  textColor?: Record<"r" | "g" | "b" | "a", number>
  fontFamily?: string
  fontWeight?: string
}

const MenuItem: UserComponent<MenuItemProps> = ({
  item,
  layout,
  titleColor,
  textColor,
  fontFamily,
  fontWeight
}) => {
  const {
    connectors: { connect }
  } = useNode()
  return (
    <div ref={connect} className="flex flex-col px-4">
      <div className="flex flex-row items-start gap-4">
        {layout === "image" ? (
          <div className="flex items-center">
            <Image
              src={item.image}
              blurDataURL={item.imageBlurhash}
              width={128}
              height={96}
              alt={item.title}
              layout="fixed"
              className="h-24 w-32 rounded"
            ></Image>
          </div>
        ) : null}
        <div className="flex-1">
          {layout === "center" ? (
            <>
              <Font family={fontFamily}>
                <h3
                  className="text-center text-lg"
                  style={{
                    color: `rgba(${Object.values(titleColor)})`,
                    fontWeight
                  }}
                >
                  {item.title}
                </h3>
              </Font>
              <div
                style={{
                  color: `rgba(${Object.values(textColor)})`
                }}
              >
                <span className="text-center text-sm line-clamp-3">
                  {item.description}
                </span>
              </div>
              <Font family={fontFamily}>
                <div
                  className="mt-1 text-center"
                  style={{
                    color: `rgba(${Object.values(titleColor)})`,
                    fontWeight
                  }}
                >
                  <span>${item.price}</span>
                </div>
              </Font>
              <div
                style={{
                  color: `rgba(${Object.values(textColor)})`
                }}
              >
                <span className="text-xs italic">{item.extras}</span>
              </div>
            </>
          ) : (
            <>
              <Font family={fontFamily}>
                <div
                  className="flex flex-row items-center justify-between"
                  style={{
                    color: `rgba(${Object.values(titleColor)})`,
                    fontWeight
                  }}
                >
                  <h3 className="text-lg">{item.title}</h3>
                  <span>${item.price}</span>
                </div>
              </Font>
              <div
                style={{
                  color: `rgba(${Object.values(textColor)})`
                }}
              >
                <span className="text-sm line-clamp-3">{item.description}</span>
              </div>
              <div
                style={{
                  color: `rgba(${Object.values(textColor)})`
                }}
              >
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
    layout: "default",
    titleColor: { r: 38, g: 50, b: 56, a: 1 },
    textColor: { r: 82, g: 82, b: 82, a: 1 },
    fontFamily: "Inter",
    fontWeight: "400"
  },
  related: {
    toolbar: MenuItemSettings
  }
}

export default MenuItem
