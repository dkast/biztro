import Image from "next/image"

import FontWrapper from "@/components/menu-editor/font-wrapper"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import type { ItemBlockProps } from "./item-block"

interface ItemDetailProps extends ItemBlockProps {
  isOpen: boolean
  onClose: () => void
}

export function ItemDetail({
  item,
  isOpen,
  onClose,
  itemFontFamily,
  itemFontWeight,
  descriptionFontFamily,
  priceFontFamily,
  priceFontWeight
}: ItemDetailProps) {
  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="mx-auto h-[96%] max-w-lg px-3">
        <DrawerHeader>
          <DrawerTitle>Detalle del menú</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col gap-4">
          {item.image ? (
            <Image
              src={item.image}
              width={400}
              height={300}
              alt={item.name}
              className="h-48 w-full rounded-lg object-cover shadow"
              unoptimized
            />
          ) : (
            <div
              className="h-[300px] w-full rounded-lg bg-gray-50 bg-cover bg-center shadow dark:bg-gray-800"
              style={{
                backgroundImage: 'url("/bg/leaf.svg")'
              }}
            ></div>
          )}
          <FontWrapper fontFamily={itemFontFamily}>
            <h2
              style={{
                fontWeight: itemFontWeight
              }}
              className="text-xl"
            >
              {item.name}
            </h2>
          </FontWrapper>
          <FontWrapper fontFamily={descriptionFontFamily}>
            <Label className="text-gray-500">Descripción</Label>
            <p className="text-pretty">{item.description}</p>
          </FontWrapper>
          <FontWrapper fontFamily={priceFontFamily}>
            <div className="flex flex-col gap-2">
              {item.variants.map(variant => (
                <div key={variant.id} className="flex justify-between">
                  {item.variants.length > 1 && <span>{variant.name}</span>}
                  <span
                    style={{
                      fontWeight: priceFontWeight
                    }}
                    className={
                      item.variants.length === 1
                        ? "w-full text-left text-lg"
                        : ""
                    }
                  >
                    $
                    {variant.price % 1 === 0
                      ? variant.price
                      : variant.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </FontWrapper>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
