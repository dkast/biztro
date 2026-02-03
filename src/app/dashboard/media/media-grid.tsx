import { Images } from "lucide-react"

import { getAllMediaAssets } from "@/server/actions/media/queries"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"

import { MediaCard } from "./media-card"

export async function MediaGrid() {
  const assets = await getAllMediaAssets()

  if (assets.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Images className="size-5" />
          </EmptyMedia>
          <EmptyTitle>No hay imágenes</EmptyTitle>
          <EmptyDescription>
            Sube imágenes desde los productos o la configuración de tu
            organización
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {assets.map(asset => (
        <MediaCard key={asset.id} asset={asset} />
      ))}
    </div>
  )
}
