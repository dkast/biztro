export type ForegroundTextTone = "light" | "dark"

export const BgImages = [
  {
    image: "bg-top-burger-1.jpg",
    name: "Burger",
    foregroundTextTone: "light"
  },
  {
    image: "bg-bottom-burger-2.jpg",
    name: "Burger 2",
    foregroundTextTone: "light"
  },
  {
    image: "bg-center-cafe-1.jpg",
    name: "Café",
    foregroundTextTone: "light"
  },
  {
    image: "bg-center-cafe-2.jpg",
    name: "Café 2",
    foregroundTextTone: "dark"
  },
  {
    image: "bg-top-tomates-1.jpg",
    name: "Fresco",
    foregroundTextTone: "light"
  },
  {
    image: "bg-top-salad-1.jpg",
    name: "Fresco 2",
    foregroundTextTone: "light"
  },
  {
    image: "bg-top-fusion-1.jpg",
    name: "Fusión",
    foregroundTextTone: "light"
  },
  {
    image: "bg-top-fusion-2.jpg",
    name: "Fusión 2",
    foregroundTextTone: "light"
  },
  {
    image: "bg-top-ice-cream-1.jpg",
    name: "Helados",
    foregroundTextTone: "dark"
  },
  {
    image: "bg-top-ice-cream-2.jpg",
    name: "Helados 2",
    foregroundTextTone: "dark"
  },
  {
    image: "bg-center-ice-cream-3.jpg",
    name: "Yogurt",
    foregroundTextTone: "dark"
  },
  {
    image: "bg-center-pizza-1.jpg",
    name: "Italiano",
    foregroundTextTone: "light"
  },
  {
    image: "bg-top-mariscos-1.jpg",
    name: "Mariscos",
    foregroundTextTone: "dark"
  },
  {
    image: "bg-top-mariscos-2.jpg",
    name: "Mariscos 2",
    foregroundTextTone: "light"
  },
  {
    image: "bg-center-molcajete-1.jpg",
    name: "Mexicano",
    foregroundTextTone: "light"
  },
  {
    image: "bg-center-parrilla-1.jpg",
    name: "Parrilla",
    foregroundTextTone: "light"
  },
  {
    image: "bg-top-tacos-1.jpg",
    name: "Pastor",
    foregroundTextTone: "dark"
  },
  {
    image: "bg-center-pizza-2.jpg",
    name: "Pizza",
    foregroundTextTone: "light"
  },
  {
    image: "bg-center-pizza-3.jpg",
    name: "Pizza 2",
    foregroundTextTone: "dark"
  },
  {
    image: "bg-center-sushi-1.jpg",
    name: "Sushi",
    foregroundTextTone: "light"
  },
  {
    image: "bg-center-sushi-2.jpg",
    name: "Sushi 2",
    foregroundTextTone: "dark"
  },
  {
    image: "bg-top-tacos-2.jpg",
    name: "Tacos",
    foregroundTextTone: "light"
  },
  {
    image: "bg-center-tacos-3.jpg",
    name: "Tacos 2",
    foregroundTextTone: "light"
  },
  {
    image: "bg-top-bakery-1.jpg",
    name: "Postre",
    foregroundTextTone: "dark"
  },
  {
    image: "bg-top-bakery-2.jpg",
    name: "Postre 2",
    foregroundTextTone: "dark"
  },
  {
    image: "bg-top-breakfast-1.jpg",
    name: "Pancakes",
    foregroundTextTone: "dark"
  },
  {
    image: "bg-top-breakfast-2.jpg",
    name: "Waffles",
    foregroundTextTone: "dark"
  }
] satisfies Array<{
  image: string
  name: string
  foregroundTextTone: ForegroundTextTone
}>

export const enum ImageType {
  LOGO = "LOGO",
  BANNER = "BANNER",
  MENUITEM = "MENUITEM",
  MENU_BACKGROUND = "MENU_BACKGROUND"
}

export const enum MediaAssetType {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  DOCUMENT = "DOCUMENT"
}

export const enum MediaAssetScope {
  MENU_ITEM_IMAGE = "MENU_ITEM_IMAGE",
  ORG_LOGO = "ORG_LOGO",
  ORG_BANNER = "ORG_BANNER",
  PROMO = "PROMO",
  OTHER = "OTHER"
}

export const enum MediaUsageEntityType {
  MENU_ITEM = "MENU_ITEM",
  ORGANIZATION = "ORGANIZATION",
  PROMO = "PROMO"
}

export const SUPPORTED_UPLOAD_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp"
] as const

export type SupportedUploadMimeType =
  (typeof SUPPORTED_UPLOAD_MIME_TYPES)[number]
