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
      <div
        className="relative h-full overflow-hidden bg-[#fffdfa] py-14
          dark:bg-gray-950"
      >
        <div
          className="absolute inset-0
            bg-[radial-gradient(circle_at_top_right,#fef08a_0%,transparent_40%),radial-gradient(circle_at_top_left,#fed7aa_0%,transparent_40%),radial-gradient(circle_at_bottom,#fbcfe8_0%,transparent_50%)]
            opacity-60 dark:opacity-20"
        />
        <div className="relative z-10 container flex flex-col">
          <div className="mt-20 grid grid-cols-1">
            <div className="flex flex-col items-center gap-6 pb-8 text-center">
              {/* Top announcement */}
              <div className="grid grid-cols-1 grid-rows-1">
                <motion.div
                  className={cn(
                    `group relative col-start-1 row-start-1 cursor-pointer
                    rounded-full border border-orange-900/10 bg-white/50
                    transition-all ease-in hover:bg-orange-50
                    dark:border-white/5 dark:bg-gray-900 dark:hover:bg-gray-800`
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
                  <AnimatedShinyText
                    className="inset-0 inline-flex items-center justify-center
                      px-4 py-1 text-xs transition ease-out
                      hover:text-orange-900 hover:duration-300 sm:text-sm
                      dark:hover:text-orange-100"
                  >
                    📣 Biztro en versión beta
                    <ArrowRightIcon
                      className="ml-1 size-3 transition-transform duration-300
                        ease-in-out group-hover:translate-x-1"
                    />
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
                className="font-display bg-linear-to-br from-orange-950 from-30%
                  to-orange-950/60 bg-clip-text py-6 text-5xl leading-none
                  font-medium tracking-tighter text-balance text-transparent
                  sm:text-6xl md:text-7xl lg:text-8xl dark:from-orange-50
                  dark:to-orange-50/40"
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
                Tu menú digital, <br />
                sin complicaciones
              </motion.h1>

              <motion.p
                className="text-lg tracking-tight text-balance
                  text-orange-950/70 md:text-xl dark:text-orange-100/70"
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
                Crea, actualiza y comparte el menú de tu restaurante en minutos.
                Diseñado para dueños de negocios, no para programadores.
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
                <span className="text-orange-950/60 dark:text-orange-100/60">
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
