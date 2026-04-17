"use client"

import { useRef } from "react"
import { ArrowRightIcon } from "lucide-react"
import { motion, useInView } from "motion/react"
import Link from "next/link"

import {
  Announcement,
  AnnouncementTag,
  AnnouncementTitle
} from "@/components/kibo-ui/announcement"
import Waitlist from "@/components/marketing/waitlist"

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
        className="relative h-full overflow-hidden bg-taupe-100 py-14
          dark:bg-taupe-950"
      >
        <div
          className="absolute inset-0
            bg-[radial-gradient(circle_at_top_right,oklch(92.2%_0.005_34.3)_0%,transparent_40%),radial-gradient(circle_at_top_left,oklch(86.8%_0.007_39.5)_0%,transparent_30%)]
            opacity-70 dark:opacity-10"
        />
        <div
          className="relative z-10 mx-auto flex max-w-6xl flex-col px-4 sm:px-6
            lg:px-8"
        >
          <div
            className="mt-20 grid grid-cols-1 gap-x-8 gap-y-8 pb-8
              md:grid-cols-3"
          >
            {/* Badge + H1: spans cols 1–2 */}
            <div
              className="flex flex-col items-center gap-6 text-center
                md:col-span-2 md:items-start md:text-left"
            >
              {/* Top announcement */}
              <motion.div
                animate={fadeInInView ? "animate" : "hidden"}
                variants={fadeUpVariants}
                initial={false}
                transition={{
                  duration: 0.6,
                  delay: 0,
                  ease: "easeIn"
                }}
              >
                <Link href="/blog/beta-biztro" prefetch={false}>
                  <Announcement
                    className="inset-ring-taupe-950/20 hover:ring-taupe-950/30"
                  >
                    <AnnouncementTag className="bg-indigo-100 text-indigo-800">
                      Nuevo
                    </AnnouncementTag>
                    <AnnouncementTitle className="pr-0.5">
                      Biztro está en beta
                      <ArrowRightIcon
                        className="ml-1 size-3 transition-transform duration-300
                          ease-in-out group-hover:translate-x-1"
                      />
                    </AnnouncementTitle>
                  </Announcement>
                </Link>
              </motion.div>
              <motion.h1
                ref={fadeInRef}
                className="font-display bg-linear-to-br from-taupe-950 from-30%
                  to-taupe-800/70 bg-clip-text pt-6 text-4xl leading-[1.1]
                  font-semibold tracking-tighter text-pretty text-transparent
                  sm:text-5xl md:text-5xl lg:text-6xl dark:from-taupe-50
                  dark:to-taupe-300/60"
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
                Crea tu menú digital y publícalo en minutos
              </motion.h1>
            </div>

            {/* Tagline: cols 1–2, row 2 */}
            <motion.p
              className="text-center text-lg tracking-tight text-balance
                text-taupe-700 md:col-span-2 md:col-start-1 md:row-start-2
                md:text-left md:text-xl dark:text-taupe-300"
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
              Diseña un menú QR profesional para tu restaurante o cafetería,
              actualízalo cuando quieras y compártelo sin complicarte.
            </motion.p>

            {/* CTA: col 3, rows 1–2, centered */}
            <motion.div
              animate={fadeInInView ? "animate" : "initial"}
              variants={fadeUpVariants}
              className="flex flex-col items-center gap-2 text-sm md:col-start-3
                md:row-span-2 md:row-start-1 md:items-start md:justify-end"
              initial={false}
              transition={{
                duration: 0.6,
                delay: 0.3,
                ease: [0.21, 0.47, 0.32, 0.98],
                type: "spring"
              }}
            >
              <span className="px-3.5 text-taupe-500 dark:text-taupe-400">
                Solicita acceso anticipado
              </span>
              <Waitlist />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
