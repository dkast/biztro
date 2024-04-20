import { PhotoView } from "react-photo-view"
import Image from "next/image"

import { cn } from "@/lib/utils"

export default function ImageViewer({
  src,
  className
}: {
  src: string
  className?: string
}) {
  return (
    <PhotoView src={src}>
      <Image
        src={src}
        alt=""
        className={cn(
          "h-16 w-20 cursor-zoom-in rounded-lg object-cover",
          className
        )}
        width={80}
        height={64}
        unoptimized
      />
    </PhotoView>
  )
}
