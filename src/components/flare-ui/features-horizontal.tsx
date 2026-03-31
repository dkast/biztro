"use client"

import React, { useEffect, useRef, useState } from "react"
import * as Accordion from "@radix-ui/react-accordion"
import { AnimatePresence, motion, useInView } from "motion/react"
import Image from "next/image"

import { cn } from "@/lib/utils"

type CardDataProps = {
  id: number
  title: string
  content: string
  image?: string
  video?: string
  icon?: React.ReactNode
}

export type FeaturesProps = {
  collapseDelay?: number
  ltr?: boolean
  linePosition?: "left" | "right" | "top" | "bottom"
  data: CardDataProps[]
}

export default function Features({
  collapseDelay = 5000,
  ltr = false,
  linePosition = "bottom",
  data = []
}: FeaturesProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(-1)

  const carouselRef = useRef<HTMLUListElement>(null)
  const ref = useRef(null)
  const isInView = useInView(ref, {
    once: true,
    amount: 0.5
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isInView) {
        setCurrentIndex(0)
      } else {
        setCurrentIndex(-1)
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [isInView])

  const scrollToIndex = (index: number) => {
    if (carouselRef.current) {
      const card = carouselRef.current.querySelectorAll(".card")[index]
      if (card) {
        const cardRect = card.getBoundingClientRect()
        const carouselRect = carouselRef.current.getBoundingClientRect()
        const offset =
          cardRect.left -
          carouselRect.left -
          (carouselRect.width - cardRect.width) / 2

        carouselRef.current.scrollTo({
          left: carouselRef.current.scrollLeft + offset,
          behavior: "smooth"
        })
      }
    }
  }

  useEffect(() => {
    if (!isInView || data.length === 0) return
    const timer = setInterval(() => {
      setCurrentIndex(prevIndex =>
        prevIndex !== undefined ? (prevIndex + 1) % data.length : 0
      )
    }, collapseDelay)

    return () => clearInterval(timer)
  }, [currentIndex, collapseDelay, data.length, isInView])

  useEffect(() => {
    if (!isInView || data.length === 0) return
    const handleAutoScroll = () => {
      const nextIndex =
        (currentIndex !== undefined ? currentIndex + 1 : 0) % data.length
      scrollToIndex(nextIndex)
    }

    const autoScrollTimer = setInterval(handleAutoScroll, collapseDelay)

    return () => clearInterval(autoScrollTimer)
  }, [currentIndex, collapseDelay, data.length, isInView])

  useEffect(() => {
    const carousel = carouselRef.current
    if (carousel) {
      const handleScroll = () => {
        const scrollLeft = carousel.scrollLeft
        const cardWidth = carousel.querySelector(".card")?.clientWidth || 0
        const newIndex = Math.min(
          Math.floor(scrollLeft / cardWidth),
          data.length - 1
        )
        setCurrentIndex(newIndex)
      }

      carousel.addEventListener("scroll", handleScroll)
      return () => carousel.removeEventListener("scroll", handleScroll)
    }
  }, [data.length])

  const isVerticalLine = linePosition === "left" || linePosition === "right"
  const isHorizontalLine = linePosition === "top" || linePosition === "bottom"

  return (
    <section ref={ref} id="features">
      {/* ── Desktop step cards ── */}
      <div
        className={cn("hidden md:flex", ltr ? "justify-end" : "justify-start")}
      >
        <Accordion.Root
          className="grid w-full gap-x-6 py-8 md:grid-cols-3 lg:gap-x-10"
          type="single"
          defaultValue={`item-${currentIndex}`}
          value={`item-${currentIndex}`}
          onValueChange={value => setCurrentIndex(Number(value.split("-")[1]))}
        >
          {data.map((item, index) => {
            const isActive = currentIndex === index
            return (
              <Accordion.Item
                key={item.id}
                className="group relative cursor-pointer pb-6"
                value={`item-${index}`}
              >
                {/* Progress indicator — vertical */}
                {isVerticalLine && (
                  <div
                    className={cn(
                      `absolute top-0 bottom-0 w-0.5 overflow-hidden
                      rounded-full bg-taupe-200 dark:bg-taupe-800`,
                      linePosition === "right"
                        ? "right-0 left-auto"
                        : "right-auto left-0"
                    )}
                  >
                    <div
                      className={cn(
                        `absolute top-0 left-0 w-full origin-top transition-all
                        ease-linear`,
                        "bg-primary dark:bg-taupe-200",
                        isActive ? "h-full" : "h-0"
                      )}
                      style={{
                        transitionDuration: isActive
                          ? `${collapseDelay}ms`
                          : "0s"
                      }}
                    />
                  </div>
                )}

                {/* Progress indicator — horizontal */}
                {isHorizontalLine && (
                  <div
                    className={cn(
                      `absolute right-0 left-0 h-0.5 overflow-hidden
                      rounded-full bg-taupe-200 dark:bg-taupe-800`,
                      linePosition === "bottom" ? "bottom-0" : "top-0"
                    )}
                  >
                    <div
                      className={cn(
                        `absolute left-0 h-full origin-left transition-all
                        ease-linear`,
                        "bg-primary dark:bg-taupe-200",
                        linePosition === "bottom" ? "bottom-0" : "top-0",
                        isActive ? "w-full" : "w-0"
                      )}
                      style={{
                        transitionDuration: isActive
                          ? `${collapseDelay}ms`
                          : "0s"
                      }}
                    />
                  </div>
                )}

                <Accordion.Header>
                  <Accordion.Trigger className="w-full text-left">
                    <div className="flex flex-col items-center gap-3">
                      {/* Icon */}
                      <div
                        className={cn(
                          `relative flex size-14 shrink-0 items-center
                          justify-center rounded-2xl transition-all
                          duration-300`,
                          isActive
                            ? `bg-primary/15 text-primary ring-primary/25 ring-1
                              dark:bg-taupe-800 dark:text-taupe-50
                              dark:ring-taupe-600`
                            : `bg-taupe-100 text-taupe-500 ring-1 ring-taupe-200
                              dark:bg-taupe-900 dark:text-taupe-400
                              dark:ring-taupe-700`
                        )}
                      >
                        {/* Subtle glow behind active icon */}
                        {isActive && (
                          <span
                            className="absolute inset-0 -z-10 rounded-2xl
                              opacity-40 blur-lg"
                            style={{
                              background:
                                "var(--primary, oklch(64.6% 0.222 41.116))"
                            }}
                          />
                        )}
                        {item.icon}
                      </div>

                      {/* Title */}
                      <h3
                        className={cn(
                          `font-display text-lg font-semibold tracking-tight
                          transition-colors duration-200`,
                          isActive
                            ? "text-taupe-950 dark:text-taupe-50"
                            : "text-taupe-600 dark:text-taupe-400"
                        )}
                      >
                        {item.title}
                      </h3>

                      {/* Description */}
                      <p
                        className={cn(
                          `text-center text-sm leading-relaxed text-pretty
                          transition-colors duration-200`,
                          isActive
                            ? "text-taupe-700 dark:text-taupe-300"
                            : "text-taupe-500 dark:text-taupe-500"
                        )}
                      >
                        {item.content}
                      </p>
                    </div>
                  </Accordion.Trigger>
                </Accordion.Header>
              </Accordion.Item>
            )
          })}
        </Accordion.Root>
      </div>

      {/* ── Image / Video display ── */}
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-xl sm:rounded-2xl",
          "aspect-2984/1644",
          `bg-taupe-100 ring-1 ring-taupe-200 dark:bg-taupe-900
          dark:ring-taupe-800`,
          ltr && "md:order-1"
        )}
      >
        <AnimatePresence mode="sync">
          {data[currentIndex]?.image ? (
            <motion.div
              key={`img-${currentIndex}`}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <Image
                src={data[currentIndex].image!}
                alt={data[currentIndex].title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1100px"
                className="object-contain object-top"
                priority={currentIndex === 0}
              />
            </motion.div>
          ) : data[currentIndex]?.video ? (
            <motion.video
              key={`vid-${currentIndex}`}
              preload="auto"
              src={data[currentIndex].video}
              className="absolute inset-0 h-full w-full object-cover"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
              autoPlay
              loop
              muted
            />
          ) : (
            <motion.div
              key={`empty-${currentIndex}`}
              className="absolute inset-0 bg-taupe-100 dark:bg-taupe-900"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ── Mobile carousel ── */}
      <ul
        ref={carouselRef}
        className="flex snap-x snap-mandatory flex-nowrap overflow-x-auto py-8
          [-ms-overflow-style:none] [scrollbar-width:none] md:hidden
          [&::-webkit-scrollbar]:hidden"
        style={{ padding: "32px calc(50%)" }}
      >
        {data.map((item, index) => {
          const isActive = currentIndex === index
          return (
            <li
              key={item.id}
              className={cn(
                `card relative mr-6 grid shrink-0 snap-center items-start gap-2
                rounded-xl px-4 py-4`,
                "w-65 transition-colors duration-200",
                isActive
                  ? `bg-taupe-100 ring-1 ring-taupe-200 dark:bg-taupe-900
                    dark:ring-taupe-700`
                  : "bg-transparent"
              )}
              onClick={() => setCurrentIndex(index)}
            >
              {/* Progress bar */}
              <div
                className="h-0.5 w-full overflow-hidden rounded-full
                  bg-taupe-200 dark:bg-taupe-800"
              >
                <div
                  className={cn(
                    "h-full origin-left transition-all ease-linear",
                    "bg-primary dark:bg-taupe-200",
                    isActive ? "w-full" : "w-0"
                  )}
                  style={{
                    transitionDuration: isActive ? `${collapseDelay}ms` : "0s"
                  }}
                />
              </div>
              <h2
                className={cn(
                  "font-display text-base font-semibold transition-colors",
                  isActive
                    ? "text-taupe-950 dark:text-taupe-50"
                    : "text-taupe-600 dark:text-taupe-400"
                )}
              >
                {item.title}
              </h2>
              <p className="text-sm leading-relaxed text-pretty text-taupe-500">
                {item.content}
              </p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
