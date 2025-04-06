"use client"

import React, { useEffect, useRef, useState, type ReactNode } from "react"
import * as Accordion from "@radix-ui/react-accordion"
import { motion, useInView } from "motion/react"

import { cn } from "@/lib/utils"

type AccordionItemProps = {
  children: React.ReactNode
  className?: string
} & Accordion.AccordionItemProps

const AccordionItem = ({
  ref: forwardedRef,
  children,
  className,
  ...props
}: AccordionItemProps & {
  ref: React.RefObject<HTMLDivElement>
}) => (
  <Accordion.Item
    className={cn("mt-px focus-within:relative focus-within:z-10", className)}
    {...props}
    ref={forwardedRef}
  >
    {children}
  </Accordion.Item>
)
AccordionItem.displayName = "AccordionItem"

type AccordionTriggerProps = {
  children: React.ReactNode
  className?: string
}

const AccordionTrigger = ({
  ref: forwardedRef,
  children,
  className,
  ...props
}: AccordionTriggerProps & {
  ref: React.RefObject<HTMLButtonElement>
}) => (
  <Accordion.Header className="">
    <Accordion.Trigger
      className={cn("", className)}
      {...props}
      ref={forwardedRef}
    >
      {children}
    </Accordion.Trigger>
  </Accordion.Header>
)
AccordionTrigger.displayName = "AccordionTrigger"

type AccordionContentProps = {
  children: ReactNode
  className?: string
} & Accordion.AccordionContentProps

const AccordionContent = ({
  ref: forwardedRef,
  children,
  className,
  ...props
}: AccordionContentProps & {
  ref: React.RefObject<HTMLDivElement>
}) => (
  <Accordion.Content
    className={cn(
      "data-[state=closed]:animate-slide-up data-[state=open]:animate-slide-down",
      className
    )}
    {...props}
    ref={forwardedRef}
  >
    <div className="px-5 py-2">{children}</div>
  </Accordion.Content>
)
AccordionContent.displayName = "AccordionContent"

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
  linePosition = "left",
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
    const timer = setInterval(() => {
      setCurrentIndex(prevIndex =>
        prevIndex !== undefined ? (prevIndex + 1) % data.length : 0
      )
    }, collapseDelay)

    return () => clearInterval(timer)
  }, [currentIndex])

  useEffect(() => {
    const handleAutoScroll = () => {
      const nextIndex =
        (currentIndex !== undefined ? currentIndex + 1 : 0) % data.length
      scrollToIndex(nextIndex)
    }

    const autoScrollTimer = setInterval(handleAutoScroll, collapseDelay)

    return () => clearInterval(autoScrollTimer)
  }, [currentIndex])

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
  }, [])

  return (
    <section ref={ref} id="features">
      <div className="mx-4">
        <div className="mx-auto max-w-6xl">
          <div className="">
            <div
              className={`order-1 hidden md:order-0 md:flex ${
                ltr ? "md:order-2 md:justify-end" : "justify-start"
              }`}
            >
              <Accordion.Root
                className="grid gap-x-10 py-8 md:grid-cols-3"
                type="single"
                defaultValue={`item-${currentIndex}`}
                value={`item-${currentIndex}`}
                onValueChange={value =>
                  setCurrentIndex(Number(value.split("-")[1]))
                }
              >
                {data.map((item, index) => (
                  <AccordionItem
                    key={item.id}
                    className="relative mb-8"
                    value={`item-${index}`}
                  >
                    {linePosition === "left" || linePosition === "right" ? (
                      <div
                        className={`absolute top-0 bottom-0 h-full w-0.5 overflow-hidden rounded-lg bg-neutral-300/50 dark:bg-neutral-300/30 ${
                          linePosition === "right"
                            ? "right-0 left-auto"
                            : "right-auto left-0"
                        }`}
                      >
                        <div
                          className={`absolute top-0 left-0 w-full ${
                            currentIndex === index ? "h-full" : "h-0"
                          } bg-primary origin-top transition-all ease-linear dark:bg-white`}
                          style={{
                            transitionDuration:
                              currentIndex === index
                                ? `${collapseDelay}ms`
                                : "0s"
                          }}
                        ></div>
                      </div>
                    ) : null}

                    {linePosition === "top" || linePosition === "bottom" ? (
                      <div
                        className={`absolute right-0 left-0 h-0.5 w-full overflow-hidden rounded-lg bg-neutral-300/50 dark:bg-neutral-300/30 ${
                          linePosition === "bottom" ? "bottom-0" : "top-0"
                        }`}
                      >
                        <div
                          className={`absolute left-0 ${
                            linePosition === "bottom" ? "bottom-0" : "top-0"
                          } h-full ${
                            currentIndex === index ? "w-full" : "w-0"
                          } bg-primary origin-left transition-all ease-linear dark:bg-white`}
                          style={{
                            transitionDuration:
                              currentIndex === index
                                ? `${collapseDelay}ms`
                                : "0s"
                          }}
                        ></div>
                      </div>
                    ) : null}

                    <AccordionTrigger>
                      <div className="relative flex flex-col items-center">
                        <div className="item-box mx-2 flex size-16 shrink-0 items-center justify-center rounded-full bg-green-400/10 text-green-400 ring-1 ring-green-400/20 ring-inset sm:mx-6">
                          {item.icon}
                        </div>
                        <div className="my-3 text-xl font-bold">
                          {item.title}
                        </div>
                        <div className="mb-4 justify-center text-center text-pretty dark:text-gray-400">
                          {item.content}
                        </div>
                      </div>
                    </AccordionTrigger>
                  </AccordionItem>
                ))}
              </Accordion.Root>
            </div>
            <div
              className={`relative min-h-[200px] w-auto overflow-hidden rounded-lg sm:min-h-[630px] ${
                ltr && "md:order-1"
              }`}
            >
              {data[currentIndex]?.image ? (
                <motion.img
                  key={currentIndex}
                  src={data[currentIndex].image}
                  alt="feature"
                  className="relative aspect-auto h-full w-full rounded-lg border object-cover shadow-lg dark:border-gray-800"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              ) : data[currentIndex]?.video ? (
                <video
                  preload="auto"
                  src={data[currentIndex].video}
                  className="aspect-auto h-full w-full rounded-lg border object-cover shadow-lg"
                  autoPlay
                  loop
                  muted
                />
              ) : (
                <div className="aspect-auto h-full min-h-[600px] w-full rounded-xl border border-neutral-300/50 bg-gray-200 p-1"></div>
              )}
            </div>

            <ul
              ref={carouselRef}
              className="flex h-full snap-x snap-mandatory flex-nowrap overflow-x-auto [mask-image:linear-gradient(90deg,transparent,black_20%,white_80%,transparent)] py-10 [-ms-overflow-style:none] [-webkit-mask-image:linear-gradient(90deg,transparent,black_20%,white_80%,transparent)] [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden"
              style={{
                padding: "50px calc(50%)"
              }}
            >
              {data.map((item, index) => (
                <div
                  key={item.id}
                  className="card relative mr-8 grid h-full max-w-60 shrink-0 items-start justify-center py-4 last:mr-0"
                  onClick={() => setCurrentIndex(index)}
                  style={{
                    scrollSnapAlign: "center"
                  }}
                >
                  <div className="absolute top-0 right-auto bottom-0 left-0 h-0.5 w-full overflow-hidden rounded-lg bg-neutral-300/50 dark:bg-neutral-300/30">
                    <div
                      className={`absolute top-0 left-0 h-full ${
                        currentIndex === index ? "w-full" : "w-0"
                      } bg-primary origin-top transition-all ease-linear dark:bg-white`}
                      style={{
                        transitionDuration:
                          currentIndex === index ? `${collapseDelay}ms` : "0s"
                      }}
                    ></div>
                  </div>
                  <h2 className="mb-1 text-lg font-semibold">{item.title}</h2>
                  <p className="mx-0 max-w-sm text-sm text-balance text-gray-400">
                    {item.content}
                  </p>
                </div>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
