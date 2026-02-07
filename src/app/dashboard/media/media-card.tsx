"use client"

import { useState } from "react"
import { ImageUp, MoreVertical } from "lucide-react"
import Image from "next/image"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { MediaDetailsDialog } from "./media-details-dialog"
import { MediaReplaceDialog } from "./media-replace-dialog"

type MediaAsset = {
  id: string
  organizationId: string
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
  const [showReplaceDialog, setShowReplaceDialog] = useState(false)

  return (
    <>
      <div
        className="group bg-muted relative aspect-square overflow-hidden
          rounded-lg shadow-lg"
      >
        <Image
          src={asset.url}
          alt="Media asset"
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
          unoptimized
        />

        {/* Overlay with actions */}
        <div
          className="absolute inset-0 bg-black/50 opacity-0 transition-opacity
            group-hover:opacity-100"
        >
          <div className="@container flex h-full flex-col justify-between p-2">
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="bg-black/20 text-white hover:bg-black/40"
                  >
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowReplaceDialog(true)}>
                    <ImageUp className="mr-2 size-4" />
                    Reemplazar imagen
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div
              className="flex flex-col items-center justify-between gap-2
                @min-[230px]:flex-row"
            >
              <Badge
                variant="secondary"
                className="rounded-full bg-black/40 px-2.5 py-1.5 text-white
                  dark:bg-black/60"
              >
                Usado en {asset.usageCount}{" "}
                {asset.usageCount === 1 ? "lugar" : "lugares"}
              </Badge>

              <Button
                size="sm"
                variant="secondary"
                className="border border-white/50 bg-transparent text-white
                  hover:bg-white/10"
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

      <MediaReplaceDialog
        asset={asset}
        open={showReplaceDialog}
        onOpenChange={setShowReplaceDialog}
      />
    </>
  )
}
