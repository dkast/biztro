import type { CSSProperties, FC, ReactNode } from "react"

import { cn } from "@/lib/utils"

interface AnimatedShinyTextProps {
  children: ReactNode
  className?: string
  shimmerWidth?: number
}

const AnimatedShinyText: FC<AnimatedShinyTextProps> = ({
  children,
  className,
  shimmerWidth = 100
}) => {
  return (
    <span
      style={
        {
          "--shimmer-width": `${shimmerWidth}px`
        } as CSSProperties
      }
      className={cn(
        "mx-auto max-w-md text-gray-700/70 dark:text-gray-400/50",

        // Shimmer effect
        "animate-shimmer [background-size:var(--shimmer-width)_100%] bg-clip-text [background-position:0_0] bg-no-repeat [transition:background-position_1s_cubic-bezier(.6,.6,0,1)_infinite]",

        // Shimmer gradient
        "bg-linear-to-r from-transparent via-black/80 via-50% to-transparent dark:via-white/80",

        className
      )}
    >
      {children}
    </span>
  )
}

export default AnimatedShinyText
