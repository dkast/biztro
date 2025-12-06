"use client"

import { useRef } from "react"
import { ArrowRightIcon } from "lucide-react"
import { motion, useInView } from "motion/react"
import Link from "next/link"

import AnimatedShinyText from "@/components/flare-ui/animated-shiny-text"
import Waitlist from "@/components/marketing/waitlist"
import { cn } from "@/lib/utils"

export default function Hero() {
  const fadeInRef = useRef(null)
  const fadeInInView = useInView(fadeInRef, {
    once: true
  })

  const fadeUpVariants = {
    initial: {
      opacity: 0,
      y: 24
    },
    animate: {
      opacity: 1,
      y: 0
    },
    hidden: {
      opacity: 0,
      y: 0
    }
  }

  return (
    <section id="hero">
      <div className="relative h-full overflow-hidden bg-[linear-gradient(to_top,#fff_0%,#fff_40%,rgba(255,255,255,0)_100%),linear-gradient(to_right,#fecdd3,#c4b5fd)] py-14">
        <div className="z-10 container flex flex-col">
          <div className="mt-20 grid grid-cols-1">
            <div className="flex flex-col items-center gap-6 pb-8 text-center">
              {/* Top announcement */}
              <div className="grid grid-cols-1 grid-rows-1">
                <motion.div
                  className={cn(
                    "group relative col-start-1 row-start-1 cursor-pointer rounded-full border border-white/30 bg-white/20 transition-all ease-in hover:bg-gray-100 dark:border-white/5 dark:bg-gray-900 dark:hover:bg-gray-800"
                  )}
                  animate={fadeInInView ? "animate" : "hidden"}
                  variants={fadeUpVariants}
                  initial={false}
                  transition={{
                    duration: 0.6,
                    delay: 0,
                    ease: "easeIn"
                  }}
                >
                  <AnimatedShinyText className="inset-0 inline-flex items-center justify-center px-4 py-1 text-xs transition ease-out hover:text-gray-600 hover:duration-300 sm:text-sm dark:hover:text-gray-400">
                    📣 Biztro en versión beta
                    <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
                  </AnimatedShinyText>
                </motion.div>
                <Link
                  href="/blog/beta-biztro"
                  className="z-50 col-start-1 row-start-1"
                >
                  <span className="block h-full w-full"></span>
                </Link>
              </div>
              <motion.h1
                ref={fadeInRef}
                className="font-display bg-linear-to-br from-black from-30% to-black/60 bg-clip-text py-6 text-5xl leading-none font-medium tracking-tighter text-balance text-transparent sm:text-6xl md:text-7xl lg:text-8xl dark:from-white dark:to-white/40"
                animate={fadeInInView ? "animate" : "initial"}
                variants={fadeUpVariants}
                initial={false}
                transition={{
                  duration: 0.6,
                  delay: 0.1,
                  ease: [0.21, 0.47, 0.32, 0.98],
                  type: "spring"
                }}
              >
                Tu menú digital <br />
                en minutos
              </motion.h1>

              <motion.p
                className="text-lg tracking-tight text-balance text-gray-500 md:text-xl"
                animate={fadeInInView ? "animate" : "initial"}
                variants={fadeUpVariants}
                initial={false}
                transition={{
                  duration: 0.6,
                  delay: 0.2,
                  ease: [0.21, 0.47, 0.32, 0.98],
                  type: "spring"
                }}
              >
                Con Biztro, crea y administra tu menú online de forma sencilla.
              </motion.p>

              <motion.div
                animate={fadeInInView ? "animate" : "initial"}
                variants={fadeUpVariants}
                className="mt-10 flex flex-col gap-4"
                initial={false}
                transition={{
                  duration: 0.6,
                  delay: 0.3,
                  ease: [0.21, 0.47, 0.32, 0.98],
                  type: "spring"
                }}
              >
                <span className="text-gray-500">
                  Únete a nuestra lista de espera
                </span>
                <Waitlist />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
