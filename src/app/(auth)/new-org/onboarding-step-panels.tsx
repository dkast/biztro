"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

const EASE_OUT = [0.23, 1, 0.32, 1] as const

// Steps differ in height, so the container follows the content height instead
// of jumping, and the incoming step fades in.
export function OnboardingStepPanels({
  activeStep,
  children
}: {
  activeStep: string
  children: React.ReactNode
}) {
  const shouldReduceMotion = useReducedMotion()
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const element = contentRef.current
    if (!element) return

    const observer = new ResizeObserver(() => {
      setHeight(element.getBoundingClientRect().height)
    })
    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return (
    <motion.div
      className="min-w-0 flex-1"
      style={{ overflow: isAnimating ? "hidden" : "visible" }}
      initial={false}
      animate={{ height: height ?? "auto" }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.25,
        ease: EASE_OUT
      }}
      onAnimationStart={() => setIsAnimating(true)}
      onAnimationComplete={() => setIsAnimating(false)}
    >
      <div ref={contentRef}>
        <AnimatePresence initial={false}>
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
