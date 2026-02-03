"use client"

import { useState } from "react"
import { MoreVertical, Trash2 } from "lucide-react"
import Image from "next/image"

import { deleteMediaAsset } from "@/server/actions/media/mutations"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

import { MediaDetailsDialog } from "./media-details-dialog"

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

export function MediaCard({ asset }: { asset: MediaAsset }) {
  const [showDetails, setShowDetails] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    if (asset.usageCount > 0) {
      toast({
        title: "No se puede eliminar",
        description:
          "Esta imagen está siendo utilizada. Elimínala de todos los lugares donde se usa primero.",
        variant: "destructive"
      })
      setShowDeleteDialog(false)
      return
    }

    setIsDeleting(true)
    try {
      const result = await deleteMediaAsset({ assetId: asset.id })

      if (result?.data?.success) {
        toast({
          title: "Imagen eliminada",
          description: "La imagen se ha eliminado correctamente"
        })
      } else {
        throw new Error(result?.validationErrors?.[0] ?? "Error desconocido")
      }
    } catch (error) {
      console.error("Error deleting media:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la imagen",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <>
      <div className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
        <Image
          src={asset.url}
          alt="Media asset"
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
          unoptimized
        />

        {/* Overlay with actions */}
        <div className="absolute inset-0 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex h-full flex-col justify-between p-2">
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 bg-black/20 text-white hover:bg-black/40"
                  >
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 size-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center justify-between">
              <Badge
                variant="secondary"
                className="bg-black/40 text-white hover:bg-black/60"
              >
                Usado en {asset.usageCount}{" "}
                {asset.usageCount === 1 ? "lugar" : "lugares"}
              </Badge>

              <Button
                size="sm"
                variant="secondary"
                className="bg-black/40 text-white hover:bg-black/60"
                onClick={() => setShowDetails(true)}
              >
                Ver detalles
              </Button>
            </div>
          </div>
        </div>
      </div>

      <MediaDetailsDialog
        asset={asset}
        open={showDetails}
        onOpenChange={setShowDetails}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar imagen?</AlertDialogTitle>
            <AlertDialogDescription>
              {asset.usageCount > 0
                ? "Esta imagen está siendo utilizada. Elimínala de todos los lugares donde se usa antes de borrarla."
                : "Esta acción no se puede deshacer. La imagen será eliminada permanentemente."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            {asset.usageCount === 0 && (
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
