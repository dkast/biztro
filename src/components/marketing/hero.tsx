"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { ArrowRightIcon } from "lucide-react"
import Link from "next/link"

import AnimatedShinyText from "@/components/marketing/animated-shiny-text"
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
    }
  }

  return (
    <section id="hero">
      <div className="relative h-full overflow-hidden py-14">
        <div className="container z-10 flex flex-col">
          <div className="mt-20 grid grid-cols-1">
            <div className="flex flex-col items-center gap-6 pb-8 text-center">
              {/* Top announcement */}
              <div
                className={cn(
                  "group rounded-full border border-black/10 bg-gray-50 text-base transition-all ease-in hover:cursor-pointer hover:bg-gray-100 dark:border-white/5 dark:bg-gray-900 dark:hover:bg-gray-800"
                )}
              >
                <Link href="/blog/beta-biztro">
                  <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-gray-600 hover:duration-300 hover:dark:text-gray-400">
                    <span>🚀 Biztro esta en beta</span>
                    <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
                  </AnimatedShinyText>
                </Link>
              </div>
              <motion.h1
                ref={fadeInRef}
                className="text-balance bg-gradient-to-br from-black from-30% to-black/60 bg-clip-text py-6 font-display text-5xl font-medium leading-none tracking-tighter text-transparent dark:from-white dark:to-white/40 sm:text-6xl md:text-7xl lg:text-8xl"
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
                className="text-balance text-lg tracking-tight text-gray-400 md:text-xl"
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
                Biztro te permite crea tu menú digital y QR para compartirlo con
                tus clientes
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
                  Unirse a la lista de espera
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
