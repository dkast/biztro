"use client"

import { useState } from "react"
import { ImageUp } from "lucide-react"

import { FileUploader } from "@/components/dashboard/file-uploader"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import type { ImageType } from "@/lib/types"
import { cn } from "@/lib/utils"

export function ImageField({
  organizationId,
  src,
  imageType,
  objectId,
  onUploadSuccess,
  className
}: {
  organizationId: string
  src: string
  imageType: ImageType
  objectId: string
  onUploadSuccess?: () => void
  className?: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className={cn(
        "group relative h-60 w-full overflow-hidden rounded-lg",
        className
      )}
    >
      <img
        src={src}
        alt="Foto"
        className="h-full w-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 hidden bg-black bg-opacity-50 group-hover:block">
        <div className="absolute inset-0 flex items-center justify-center">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="default"
                size="sm"
                className="border border-white/50 bg-transparent hover:bg-white/10"
              >
                <ImageUp className="mr-2 size-4" />
                Cambiar imágen
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Subir imágen</DialogTitle>
              </DialogHeader>
              <FileUploader
                organizationId={organizationId}
                imageType={imageType}
                objectId={objectId}
                onUploadSuccess={() => {
                  onUploadSuccess?.()
                  setOpen(false)
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
