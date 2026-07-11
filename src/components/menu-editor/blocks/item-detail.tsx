import Image from "next/image"

import { Allergens } from "@/components/menu-editor/blocks/item-allergens"
import FontWrapper from "@/components/menu-editor/font-wrapper"
import { useTranslation } from "@/components/menu-editor/translation-provider"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerNested,
  DrawerTitle
} from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import { useIsMobile } from "@/hooks/use-mobile"
import { formatPrice, resolveCurrency } from "@/lib/currency"
import { getUILabels } from "@/lib/ui-labels"

type DetailVariant = {
  id: string
  name?: string | null
  price?: number | null
}

export type DetailItem = {
  id: string
  name: string
  description?: string | null
  image?: string | null
  allergens?: string | null
  currency?: string | null
  variants: DetailVariant[]
}

interface ItemDetailProps {
  item: DetailItem
  isOpen: boolean
  onClose: () => void
  nested?: boolean
  itemFontFamily?: string
  itemFontWeight?: string
  descriptionFontFamily?: string
  priceFontFamily?: string
  priceFontWeight?: string
}

export function ItemDetail({
  item,
  isOpen,
  onClose,
  nested = false,
  itemFontFamily = "Inter",
  itemFontWeight = "400",
  descriptionFontFamily = "Inter",
  priceFontFamily = "Inter",
  priceFontWeight = "400"
}: ItemDetailProps) {
  const isMobile = useIsMobile()
  const translation = useTranslation()
  const t = translation?.t ?? getUILabels(null)

  const content = (
    <div className="flex flex-col gap-4">
      {item.image ? (
        <Image
          src={item.image}
          width={400}
          height={300}
          alt={item.name}
          className="h-48 w-full rounded-lg object-cover shadow-sm"
          unoptimized
        />
      ) : (
        <div
          className="h-48 w-full rounded-lg bg-gray-50 bg-cover bg-center
            shadow-sm dark:bg-gray-800"
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
        <Label className="text-gray-500">{t("description")}</Label>
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
                  item.variants.length === 1 ? "w-full text-left text-lg" : ""
                }
              >
                {formatPrice(
                  variant.price ?? 0,
                  resolveCurrency(item.currency ?? undefined)
                )}
              </span>
            </div>
          ))}
        </div>
      </FontWrapper>
      {item.allergens && (
        <Allergens allergens={item.allergens.split(",")} showLabel />
      )}
    </div>
  )

  if (isMobile) {
    const DrawerRoot = nested ? DrawerNested : Drawer
    return (
      <DrawerRoot open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="h-[96%] px-3">
          <DrawerHeader>
            <DrawerTitle>{t("menu_detail")}</DrawerTitle>
          </DrawerHeader>
          {content}
        </DrawerContent>
      </DrawerRoot>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("menu_detail")}</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}
