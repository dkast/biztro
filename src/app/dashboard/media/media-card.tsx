"use client"

import { useState } from "react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
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
  const isMobile = useIsMobile()

  const handleOpenDetails = () => {
    setShowDetails(true)
  }

  const handleOpenReplace = () => {
    setShowReplaceDialog(true)
  }

  return (
    <>
      <div
        className={`group bg-muted relative aspect-square overflow-hidden
          rounded-lg shadow-lg`}
        onClick={isMobile ? handleOpenDetails : undefined}
        role={isMobile ? "button" : undefined}
        tabIndex={isMobile ? 0 : undefined}
        onKeyDown={
          isMobile
            ? event => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  handleOpenDetails()
                }
              }
            : undefined
        }
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
          className={
            "absolute inset-0 bg-black/50 transition-opacity" +
            (isMobile ? " opacity-70" : " opacity-0 group-hover:opacity-100")
          }
        >
          <div className="flex h-full flex-col justify-end p-2">
            <Button
              size="xs"
              variant="secondary"
              className="border border-white/50 bg-transparent text-white
                backdrop-blur-lg hover:bg-white/10"
              onClick={event => {
                event.stopPropagation()
                handleOpenDetails()
              }}
            >
              Ver detalles
            </Button>
          </div>
        </div>
      </div>

      <MediaDetailsDialog
        asset={asset}
        open={showDetails}
        onOpenChange={setShowDetails}
        onReplace={handleOpenReplace}
      />

      <MediaReplaceDialog
        asset={asset}
        open={showReplaceDialog}
        onOpenChange={setShowReplaceDialog}
      />
    </>
  )
}
