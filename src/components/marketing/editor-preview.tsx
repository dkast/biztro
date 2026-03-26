"use client"

import { useRef } from "react"
import { motion, useInView } from "motion/react"
import Image from "next/image"

// import { BorderBeam } from "@/components/flare-ui/border-beam"
import GradientBlur from "@/components/flare-ui/gradient-blur"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
// import editorDark from "../../../public/editor-dark.png"
import editorLight from "../../../public/editor-light.png"

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

  const isMobile = useIsMobile()

  return (
    <section
      id="editor-preview"
      ref={fadeInRef}
      className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"
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
          `relative mt-0 h-full w-full overflow-hidden rounded-md after:absolute
          after:inset-0 after:z-10 sm:mt-10 sm:rounded-xl`,
          // isMobile
          isMobile
            ? `after:[background:linear-gradient(to_top,#f3f1f1_10%,transparent)]
              dark:after:[background:linear-gradient(to_top,#0a0a0a_10%,transparent)]`
            : `after:[background:linear-gradient(to_top,#f3f1f1_0%,transparent_50%)]
              dark:after:[background:linear-gradient(to_top,#0a0a0a_0%,transparent)]`
        )}
      >
        <div
          className={cn(
            `absolute inset-0 bottom-1/3 h-full w-full transform-gpu
            filter-[blur(120px)]`,

            // light styles
            "bg-[linear-gradient(to_bottom,#fb923c,transparent_30%)]",

            // dark styles
            "dark:bg-[linear-gradient(to_bottom,#fb923c,transparent_30%)]"
          )}
        />

        <Image
          src={editorLight}
          className="relative block h-full w-full dark:hidden"
          alt="Imagen del editor de menús en web"
        />
        {/* <Image
          src={editorDark}
          className="relative hidden h-full w-full dark:block"
          alt="Imagen del editor de menús en web"
        /> */}

        {/* Fading ring — masked so it disappears with the image fade */}
        <div
          className="pointer-events-none absolute inset-0 z-20 rounded-md border
            border-taupe-900/20
            mask-[linear-gradient(to_bottom,black_50%,transparent_100%)]
            sm:rounded-xl"
        />

        {!isMobile && (
          <>
            <GradientBlur className="-inset-x-px -bottom-px h-1/4" />
            {/* <BorderBeam size={150} /> */}
          </>
        )}
      </motion.div>
    </section>
  )
}
