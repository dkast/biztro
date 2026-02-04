import { Suspense } from "react"
import { Images } from "lucide-react"

import PageSubtitle from "@/components/dashboard/page-subtitle"
import { getMediaAssetCount } from "@/server/actions/media/queries"
import { isProMember } from "@/server/actions/user/queries"
import { appConfig } from "@/app/config"
import { MediaGrid } from "./media-grid"

export default async function MediaPage() {
  const [mediaCount, isPro] = await Promise.all([
    getMediaAssetCount(),
    isProMember()
  ])

  return (
    <div className="flex h-full flex-col">
      <div className="border-b">
        <PageSubtitle className="h-16 px-6">
          <PageSubtitle.Icon icon={Images} />
          <PageSubtitle.Title>Biblioteca de Medios</PageSubtitle.Title>
          <PageSubtitle.Description>
            {isPro ? (
              <>
                {mediaCount} {mediaCount === 1 ? "imagen" : "imágenes"}
              </>
            ) : (
              <>
                {mediaCount} de {appConfig.mediaLimit} {"imágenes"}
              </>
            )}
          </PageSubtitle.Description>
        </PageSubtitle>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <Suspense
          fallback={
            <div
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4
                lg:grid-cols-5"
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-muted aspect-square animate-pulse rounded-lg"
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
