export const BgImages = [
  {
    image: "bg-top-burger-1.jpg",
    name: "Burger"
  },
  {
    image: "bg-bottom-burger-2.jpg",
    name: "Burger 2"
  },
  {
    image: "bg-center-cafe-1.jpg",
    name: "Café"
  },
  {
    image: "bg-center-cafe-2.jpg",
    name: "Café 2"
  },
  {
    image: "bg-top-tomates-1.jpg",
    name: "Fresco"
  },
  {
    image: "bg-top-salad-1.jpg",
    name: "Fresco 2"
  },
  {
    image: "bg-top-fusion-1.jpg",
    name: "Fusión"
  },
  {
    image: "bg-top-fusion-2.jpg",
    name: "Fusión 2"
  },
  {
    image: "bg-top-ice-cream-1.jpg",
    name: "Helados"
  },
  {
    image: "bg-top-ice-cream-2.jpg",
    name: "Helados 2"
  },
  {
    image: "bg-center-ice-cream-3.jpg",
    name: "Yogurt"
  },
  {
    image: "bg-center-pizza-1.jpg",
    name: "Italiano"
  },
  {
    image: "bg-top-mariscos-1.jpg",
    name: "Mariscos"
  },
  {
    image: "bg-top-mariscos-2.jpg",
    name: "Mariscos 2"
  },
  {
    image: "bg-center-molcajete-1.jpg",
    name: "Mexicano"
  },
  {
    image: "bg-center-parrilla-1.jpg",
    name: "Parrilla"
  },
  {
    image: "bg-top-tacos-1.jpg",
    name: "Pastor"
  },
  {
    image: "bg-center-pizza-2.jpg",
    name: "Pizza"
  },
  {
    image: "bg-center-pizza-3.jpg",
    name: "Pizza 2"
  },
  {
    image: "bg-center-sushi-1.jpg",
    name: "Sushi"
  },
  {
    image: "bg-center-sushi-2.jpg",
    name: "Sushi 2"
  },
  {
    image: "bg-top-tacos-2.jpg",
    name: "Tacos"
  },
  {
    image: "bg-center-tacos-3.jpg",
    name: "Tacos 2"
  },
  {
    image: "bg-top-bakery-1.jpg",
    name: "Postre"
  },
  {
    image: "bg-top-bakery-2.jpg",
    name: "Postre 2"
  },
  {
    image: "bg-top-breakfast-1.jpg",
    name: "Pancakes"
  },
  {
    image: "bg-top-breakfast-2.jpg",
    name: "Waffles"
  }
]

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
