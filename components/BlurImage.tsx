import Image from "next/image"
import { useState } from "react"

import classNames from "@/lib/classnames"

import type { ComponentProps } from "react"
import type { WithClassName } from "@/lib/types"

interface BlurImageProps extends WithClassName, ComponentProps<typeof Image> {
  alt: string
}

export default function BlurImage(props: BlurImageProps) {
  const [isLoading, setLoading] = useState(true)
  const { width, height } = props

  return (
    <Image
      {...props}
      alt={props.alt}
      width={width}
      height={height}
      className={classNames(
        props.className,
        "duration-700 ease-in-out",
        isLoading
          ? "scale-110 blur-2xl grayscale"
          : "scale-100 blur-0 grayscale-0"
      )}
      onLoadingComplete={() => setLoading(false)}
    />
  )
}
