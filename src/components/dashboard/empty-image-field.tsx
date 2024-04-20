"use client"

import { useState } from "react"
import { ImageIcon } from "lucide-react"

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

export function EmptyImageField({
  organizationId,
  imageType,
  objectId,
  onUploadSuccess,
  className
}: {
  organizationId: string
  imageType: ImageType
  objectId: string
  onUploadSuccess?: () => void
  className?: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center space-y-2 rounded-lg border border-dashed border-gray-300 px-6 py-10",
        className
      )}
    >
      <ImageIcon className="size-10 text-gray-300" />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger>
          <Button type="button" variant="outline" size="sm">
            Subir imágen
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
  )
}
