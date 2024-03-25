"use client"

import { ImageIcon } from "lucide-react"
import { useRouter } from "next/navigation"

import { FileUploader } from "@/components/dashboard/file-uploader"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger
} from "@/components/ui/dialog"
import type { ImageType } from "@/lib/types"
import { cn } from "@/lib/utils"

export function EmptyImageField({
  organizationId,
  imageType,
  objectId,
  className
}: {
  organizationId: string
  imageType: ImageType
  objectId: string
  className?: string
}) {
  const router = useRouter()
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center space-y-2 rounded-lg border border-dashed border-gray-300 px-6 py-10",
        className
      )}
    >
      <ImageIcon className="size-10 text-gray-300" />
      <Dialog>
        <DialogTrigger>
          <Button type="button" variant="outline" size="sm">
            Subir imágen
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-xl">
          <DialogHeader>Subir imágen</DialogHeader>
          <FileUploader
            organizationId={organizationId}
            imageType={imageType}
            objectId={objectId}
            onUploadSuccess={() => {
              router.refresh()
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
