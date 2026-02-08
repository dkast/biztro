"use client"

import { Calendar, FileType, Image as ImageIcon, Ruler } from "lucide-react"
import Image from "next/image"

import { Badge } from "@/components/ui/badge"
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
  DrawerTitle
} from "@/components/ui/drawer"
import { useIsMobile } from "@/hooks/use-mobile"

type MediaAsset = {
  id: string
  storageKey: string
  url: string
  type: string
  scope: string | null
  width: number | null
  height: number | null
  bytes: number | null
  contentType: string | null
  createdAt: Date
  updatedAt: Date
  usageCount: number
  usages: Array<{
    entityType: string
    entityId: string
    field: string | null
  }>
}

export function MediaDetailsDialog({
  asset,
  open,
  onOpenChange
}: {
  asset: MediaAsset
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const isMobile = useIsMobile()

  const formatBytes = (bytes: number | null) => {
    if (!bytes) return "N/A"
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(1)} KB`
    return `${(kb / 1024).toFixed(1)} MB`
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(date))
  }

  const getEntityTypeLabel = (entityType: string) => {
    switch (entityType) {
      case "MENU_ITEM":
        return "Producto"
      case "ORGANIZATION":
        return "Organización"
      case "PROMO":
        return "Promoción"
      default:
        return entityType
    }
  }

  const getScopeLabel = (scope: string | null) => {
    if (!scope) return "Otro"
    switch (scope) {
      case "MENU_ITEM_IMAGE":
        return "Imagen de producto"
      case "ORG_LOGO":
        return "Logo de organización"
      case "ORG_BANNER":
        return "Banner de organización"
      case "PROMO":
        return "Promoción"
      case "OTHER":
        return "Otro"
      default:
        return scope
    }
  }

  const detailsContent = (
    <div className="space-y-6">
      <div
        className="bg-muted relative aspect-video overflow-hidden rounded-lg
          border"
      >
        <Image
          src={asset.url}
          alt="Preview"
          fill
          className="object-contain"
          unoptimized
        />
      </div>

      <div className="grid gap-4">
        <div className="flex items-center gap-3">
          <FileType className="text-muted-foreground size-4" />
          <div>
            <p className="text-sm font-medium">Tipo</p>
            <p className="text-muted-foreground text-sm">
              {getScopeLabel(asset.scope)}
            </p>
          </div>
        </div>

        {asset.width && asset.height && (
          <div className="flex items-center gap-3">
            <Ruler className="text-muted-foreground size-4" />
            <div>
              <p className="text-sm font-medium">Dimensiones</p>
              <p className="text-muted-foreground text-sm">
                {asset.width} × {asset.height} píxeles
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <ImageIcon className="text-muted-foreground size-4" />
          <div>
            <p className="text-sm font-medium">Tamaño</p>
            <p className="text-muted-foreground text-sm">
              {formatBytes(asset.bytes)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="text-muted-foreground size-4" />
          <div>
            <p className="text-sm font-medium">Subida</p>
            <p className="text-muted-foreground text-sm">
              {formatDate(asset.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">
          Usado en {asset.usageCount}{" "}
          {asset.usageCount === 1 ? "lugar" : "lugares"}
        </h3>
        {asset.usages.length > 0 ? (
          <div className="space-y-2">
            {asset.usages.map((usage, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border
                  p-3"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {getEntityTypeLabel(usage.entityType)}
                  </Badge>
                  {usage.field && (
                    <span className="text-muted-foreground text-sm">
                      {usage.field}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            Esta imagen no está siendo utilizada
          </p>
        )}
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh] overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle>Detalles de la imagen</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6">{detailsContent}</div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalles de la imagen</DialogTitle>
        </DialogHeader>
        {detailsContent}
      </DialogContent>
    </Dialog>
  )
}
