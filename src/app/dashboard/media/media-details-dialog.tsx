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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalles de la imagen</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image preview */}
          <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
            <Image
              src={asset.url}
              alt="Preview"
              fill
              className="object-contain"
              unoptimized
            />
          </div>

          {/* Details */}
          <div className="grid gap-4">
            <div className="flex items-center gap-3">
              <FileType className="size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Tipo</p>
                <p className="text-sm text-muted-foreground">
                  {getScopeLabel(asset.scope)}
                </p>
              </div>
            </div>

            {asset.width && asset.height && (
              <div className="flex items-center gap-3">
                <Ruler className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Dimensiones</p>
                  <p className="text-sm text-muted-foreground">
                    {asset.width} × {asset.height} píxeles
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <ImageIcon className="size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Tamaño</p>
                <p className="text-sm text-muted-foreground">
                  {formatBytes(asset.bytes)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Subida</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(asset.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Usage */}
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
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {getEntityTypeLabel(usage.entityType)}
                      </Badge>
                      {usage.field && (
                        <span className="text-sm text-muted-foreground">
                          {usage.field}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Esta imagen no está siendo utilizada
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
