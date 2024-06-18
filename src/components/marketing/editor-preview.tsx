"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"

import { BorderBeam } from "@/components/flare-ui/border-beam"
import GradientBlur from "@/components/flare-ui/gradient-blur"
import { useMobile } from "@/lib/use-mobile"
import { cn } from "@/lib/utils"

export default function EditorPreview() {
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

  const isMobile = useMobile()

  return (
    <section
      id="editor-preview"
      ref={fadeInRef}
      className="mx-auto max-w-5xl px-4 dark:bg-black sm:px-6 lg:px-8"
    >
      <motion.div
        animate={fadeInInView ? "animate" : "initial"}
        variants={fadeUpVariants}
        initial={false}
        transition={{
          duration: 1.4,
          delay: 0.4,
          ease: [0.21, 0.47, 0.32, 0.98],
          type: "spring"
        }}
        className={cn(
          "relative mt-0 h-full w-full rounded-md after:absolute after:inset-0 after:z-10 sm:mt-24 sm:rounded-xl",
          // isMobile
          isMobile
            ? "after:[background:linear-gradient(to_top,#fff_10%,transparent)] dark:after:[background:linear-gradient(to_top,#000000_10%,transparent)]"
            : "after:[background:linear-gradient(to_top,#fff_2%,transparent)] dark:after:[background:linear-gradient(to_top,#000000_2%,transparent)]"
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bottom-1/2 h-full w-full transform-gpu [filter:blur(120px)]",

            // light styles
            "[background-image:linear-gradient(to_bottom,#ffaa40,transparent_30%)]",

            // dark styles
            "dark:[background-image:linear-gradient(to_bottom,#ffffff,transparent_30%)]"
          )}
        />

        <img
          src="/editor-light.png"
          className="relative block h-full w-full rounded-md border dark:hidden sm:rounded-xl"
          alt="Imagen del editor de menús en web"
        />
        <img
          src="/editor-dark.png"
          className="relative hidden h-full w-full rounded-md border border-gray-700/70 dark:block sm:rounded-xl"
          alt="Imagen del editor de menús en web"
        />

        {!isMobile && (
          <>
            <GradientBlur className="inset-x-0 bottom-0 h-1/2" />
            <BorderBeam size={150} />
            <BorderBeam size={150} delay={7} />
          </>
        )}
      </motion.div>
    </section>
  )
}
