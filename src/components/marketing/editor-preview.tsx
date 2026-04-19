"use client"

import { useRef } from "react"
import { motion, useInView } from "motion/react"
import Image from "next/image"

import editorDark from "../../../public/editor-dark.png"
import landingBg from "../../../public/landing-bg-2.png"

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
        className="relative mt-0 mb-20 rounded-xl sm:mt-10 sm:mb-30"
      >
        {/* Background scene */}
        <div className="absolute inset-0 overflow-hidden rounded-xl">
          <Image
            src={landingBg}
            fill
            alt=""
            aria-hidden="true"
            quality={50}
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 1152px"
            priority
          />
        </div>

        {/* Editor screenshot framed over the background */}
        <div className="relative z-10 px-6 py-12">
          <div
            className="relative inline-block overflow-hidden rounded-lg
              shadow-[0_32px_80px_rgba(0,0,0,0.45)]"
          >
            <Image
              src={editorDark}
              className="block w-full"
              alt="Imagen del editor de menús en web"
            />
            {/* Overlay ring on top of the image */}
            <div
              className="pointer-events-none absolute inset-0 rounded-lg
                inset-ring inset-ring-white/10"
            />
          </div>
        </div>
      </motion.div>
    </section>
  )
}
