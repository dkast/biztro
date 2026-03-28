"use client"

import { useRef } from "react"
import { motion, useInView } from "motion/react"

import { cn } from "@/lib/utils"

export default function TitleSection({
  eyebrow,
  title,
  tagline,
  align = "center",
  inverted = false,
  className
}: {
  eyebrow?: string
  title: string
  /** Continuation text rendered in muted color inline with the title. Enables the editorial left-aligned variant. */
  tagline?: string
  align?: "center" | "left"
  /** Use on sections with a permanently dark background (no dark-mode toggling needed). */
  inverted?: boolean
  className?: string
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const isLeft = align === "left"

  return (
    <motion.div
      ref={ref}
      className={cn(
        "max-w-6xl",
        isLeft ? "" : "mx-auto text-center",
        className
      )}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{
        duration: 0.6,
        ease: [0.21, 0.47, 0.32, 0.98],
        type: "spring"
      }}
    >
      {eyebrow && (
        <small
          className={cn(
            `mb-4 block text-sm font-semibold tracking-widest uppercase
            sm:text-base`,
            inverted ? "text-taupe-400" : "text-taupe-500 dark:text-taupe-400"
          )}
        >
          {eyebrow}
        </small>
      )}
      {tagline ? (
        <h2
          className={cn(
            "font-display tracking-tighter text-pretty",
            "text-xl sm:text-3xl md:text-4xl",
            isLeft ? "max-w-[35ch]" : "text-center text-balance"
          )}
        >
          <span
            className={cn(
              inverted ? "text-taupe-50" : "text-taupe-950 dark:text-taupe-50"
            )}
          >
            {title}{" "}
          </span>
          <span
            className={cn(
              inverted ? "text-taupe-500" : "text-taupe-400 dark:text-taupe-500"
            )}
          >
            {tagline}
          </span>
        </h2>
      ) : (
        <h2
          className={cn(
            `font-display text-3xl tracking-tighter text-balance sm:text-4xl
              md:text-5xl`,
            inverted ? "text-taupe-50" : "text-taupe-950 dark:text-taupe-50"
          )}
        >
          {title}
        </h2>
      )}
    </motion.div>
  )
}
