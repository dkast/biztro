"use client"

import { useMemo } from "react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

import { FileUploader } from "@/components/dashboard/file-uploader"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer"
import { useIsMobile } from "@/hooks/use-mobile"
import { ImageType } from "@/lib/types"

type MediaAsset = {
  id: string
  organizationId: string
  storageKey: string
  url: string
  type: string
  scope: string | null
  createdAt: Date
  updatedAt: Date
  usageCount: number
  usages: Array<{
    entityType: string
    entityId: string
    field: string | null
  }>
}

function resolveReplaceTarget(asset: MediaAsset): {
  imageType: ImageType
  objectId: string
  limitDimension: number
} | null {
  switch (asset.scope) {
    case "ORG_LOGO":
      return {
        imageType: ImageType.LOGO,
        objectId: ImageType.LOGO,
        limitDimension: 500
      }
    case "ORG_BANNER":
      return {
        imageType: ImageType.BANNER,
        objectId: ImageType.BANNER,
        limitDimension: 1200
      }
    case "MENU_ITEM_IMAGE": {
      const usage = asset.usages.find(
        u =>
          u.entityType === "MENU_ITEM" &&
          u.field === "image" &&
          typeof u.entityId === "string" &&
          u.entityId.length > 0
      )

      if (!usage) return null

      return {
        imageType: ImageType.MENUITEM,
        objectId: usage.entityId,
        limitDimension: 1200
      }
    }
    default:
      return null
  }
}

export function MediaReplaceDialog({
  asset,
  open,
  onOpenChange
}: {
  asset: MediaAsset
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const isMobile = useIsMobile()

  const target = useMemo(() => resolveReplaceTarget(asset), [asset])

  const replaceContent = target ? (
    <FileUploader
      organizationId={asset.organizationId}
      imageType={target.imageType}
      objectId={target.objectId}
      limitDimension={target.limitDimension}
      onUploadSuccess={() => {
        toast.success("Imagen reemplazada")
        onOpenChange(false)
        router.refresh()
      }}
      onUploadError={() => {
        toast.error("No se pudo reemplazar la imagen")
      }}
    />
  ) : (
    <div className="text-muted-foreground text-sm">
      No se puede reemplazar esta imagen porque no tiene un destino válido
      (logo/banner/producto) o sus usos están desactualizados.
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh] overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle>Reemplazar imagen</DrawerTitle>
            <DrawerDescription>
              Esta acción reemplaza la imagen manteniendo sus usos actuales.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-6">{replaceContent}</div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Reemplazar imagen</DialogTitle>
          <DialogDescription>
            Esta acción reemplaza la imagen manteniendo sus usos actuales.
          </DialogDescription>
        </DialogHeader>

        {replaceContent}
      </DialogContent>
    </Dialog>
  )
}
