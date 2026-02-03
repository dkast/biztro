import { Suspense } from "react"
import { Images } from "lucide-react"

import { getMediaAssetCount } from "@/server/actions/media/queries"

import { MediaGrid } from "./media-grid"

export default async function MediaPage() {
  const mediaCount = await getMediaAssetCount()

  return (
    <div className="flex h-full flex-col">
      <div className="border-b">
        <div className="flex h-16 items-center gap-4 px-6">
          <Images className="size-5 text-muted-foreground" />
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Biblioteca de Medios</h1>
            <p className="text-sm text-muted-foreground">
              {mediaCount} {mediaCount === 1 ? "imagen" : "imágenes"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <Suspense
          fallback={
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square animate-pulse rounded-lg bg-muted"
                />
              ))}
            </div>
          }
        >
          <MediaGrid />
        </Suspense>
      </div>
    </div>
  )
}
