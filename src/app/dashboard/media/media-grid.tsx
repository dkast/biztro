import { getAllMediaAssets } from "@/server/actions/media/queries"
import { Empty } from "@/components/ui/empty"

import { MediaCard } from "./media-card"

export async function MediaGrid() {
  const assets = await getAllMediaAssets()

  if (assets.length === 0) {
    return (
      <Empty
        icon="image"
        title="No hay imágenes"
        description="Sube imágenes desde los productos o la configuración de tu organización"
      />
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
