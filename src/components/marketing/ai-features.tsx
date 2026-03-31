"use client"

import { useRef } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Languages,
  LockIcon,
  ScanText
} from "lucide-react"
import { motion, useInView } from "motion/react"

import TitleSection from "@/components/marketing/title-section"

/* ------------------------------------------------------------------ */
/*  Shared browser chrome for dark illustrations                      */
/* ------------------------------------------------------------------ */

function BrowserChrome({
  url,
  children
}: {
  url: string
  children: React.ReactNode
}) {
  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden rounded-xl
        bg-taupe-900/80 shadow-2xl ring-1 ring-white/8"
    >
      {/* Title bar with traffic lights */}
      <div
        className="flex items-center gap-2 border-b border-white/6 px-3.5
          py-2.5"
      >
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </div>
        {/* Navigation arrows */}
        <div className="ml-2 flex items-center gap-0.5 text-taupe-500">
          <ChevronLeft className="size-3.5" />
          <ChevronRight className="size-3.5" />
        </div>
        {/* Address bar */}
        <div
          className="mx-2 flex flex-1 items-center justify-center gap-2
            rounded-md bg-taupe-950/60 px-3 py-1 ring-1 ring-white/6"
        >
          <LockIcon className="size-3 text-taupe-700" />
          <span className="truncate text-[11px] text-taupe-400">{url}</span>
        </div>
        <div className="w-20" />
      </div>
      {/* Page content area */}
      <div className="relative flex-1 overflow-hidden">{children}</div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  CSS-only illustrations                                            */
/* ------------------------------------------------------------------ */

function ScannerIllustration() {
  return (
    <BrowserChrome url="biztro.co/scanner">
      <div className="relative h-full p-4">
        {/* Fake editor area with menu document */}
        <div
          className="relative h-full rounded-lg bg-taupe-950/60 p-4 ring-1
            ring-white/6"
        >
          {/* Simulated menu page skeleton */}
          <div className="space-y-2.5 p-3">
            <div className="h-3 w-24 rounded-full bg-taupe-700/50" />
            <div className="h-2 w-full rounded-full bg-taupe-800/60" />
            <div className="h-2 w-5/6 rounded-full bg-taupe-800/60" />
            <div className="mt-3 h-3 w-20 rounded-full bg-taupe-700/50" />
            <div className="h-2 w-full rounded-full bg-taupe-800/60" />
            <div className="h-2 w-4/5 rounded-full bg-taupe-800/60" />
            <div className="mt-3 h-3 w-28 rounded-full bg-taupe-700/50" />
            <div className="h-2 w-full rounded-full bg-taupe-800/60" />
          </div>

          {/* Animated scan line */}
          <motion.div
            className="absolute inset-x-0 h-px bg-linear-to-r from-transparent
              via-orange-500 to-transparent"
            initial={{ top: "10%" }}
            animate={{ top: ["10%", "90%", "10%"] }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          {/* Glow behind the scan line */}
          <motion.div
            className="absolute inset-x-0 h-8 bg-linear-to-r from-transparent
              via-orange-500/10 to-transparent blur-md"
            initial={{ top: "8%" }}
            animate={{ top: ["8%", "88%", "8%"] }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Corner brackets */}
          <div className="pointer-events-none absolute inset-3">
            <div
              className="absolute top-0 left-0 h-4 w-4 rounded-tl-sm border-t-2
                border-l-2 border-orange-500/70"
            />
            <div
              className="absolute top-0 right-0 h-4 w-4 rounded-tr-sm border-t-2
                border-r-2 border-orange-500/70"
            />
            <div
              className="absolute bottom-0 left-0 h-4 w-4 rounded-bl-sm
                border-b-2 border-l-2 border-orange-500/70"
            />
            <div
              className="absolute right-0 bottom-0 h-4 w-4 rounded-br-sm
                border-r-2 border-b-2 border-orange-500/70"
            />
          </div>
        </div>

        {/* Floating extraction toast */}
        <motion.div
          className="absolute right-12 bottom-12 left-12 flex items-center gap-3
            rounded-sm bg-taupe-800/90 px-4 py-3 shadow-lg ring-1 ring-white/8
            backdrop-blur-sm"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: [0, 1, 1, 0], y: [12, 0, 0, -4] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            times: [0, 0.15, 0.75, 1],
            ease: "easeInOut",
            delay: 2
          }}
        >
          <div
            className="flex size-8 shrink-0 items-center justify-center
              rounded-full bg-orange-500/20"
          >
            <ScanText className="size-4 text-orange-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-taupe-100">
              Escaneando elementos del menú...{" "}
              <motion.span
                className="ml-2 text-orange-400"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                87%
              </motion.span>
            </p>
          </div>
        </motion.div>
      </div>
    </BrowserChrome>
  )
}

function TranslationIllustration() {
  return (
    <BrowserChrome url="biztro.co/translations">
      <div className="flex h-full flex-col gap-3 p-4">
        {/* Side-by-side comparison */}
        <div className="grid flex-1 grid-cols-2 gap-3">
          {/* Original */}
          <div
            className="space-y-3 rounded-lg bg-taupe-950/60 p-3 ring-1
              ring-white/6"
          >
            <span
              className="text-[10px] font-semibold tracking-widest
                text-taupe-400 uppercase"
            >
              Original
            </span>
            <div className="space-y-2">
              <div className="h-2.5 w-20 rounded-full bg-taupe-700/50" />
              <div className="h-2 w-full rounded-full bg-taupe-800/60" />
              <div className="h-2 w-4/5 rounded-full bg-taupe-800/60" />
            </div>
            <motion.div
              className="mt-2 rounded-md bg-taupe-800/60 px-2.5 py-2 ring-1
                ring-white/6"
              initial={{ opacity: 0.6 }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <p className="text-xs font-medium text-taupe-200 italic">
                &ldquo;Filete de res...&rdquo;
              </p>
            </motion.div>
          </div>

          {/* Translated */}
          <div
            className="space-y-3 rounded-lg bg-violet-950/40 p-3 ring-1
              ring-violet-500/10"
          >
            <span
              className="text-[10px] font-semibold tracking-widest
                text-violet-400 uppercase"
            >
              Traducción IA
            </span>
            <div className="space-y-2">
              <motion.div
                className="h-2.5 w-24 rounded-full bg-violet-700/40"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  repeatDelay: 4,
                  ease: "easeOut"
                }}
                style={{ originX: 0 }}
              />
              <motion.div
                className="h-2 w-full rounded-full bg-violet-800/30"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  duration: 0.6,
                  delay: 0.3,
                  repeat: Infinity,
                  repeatDelay: 4.2,
                  ease: "easeOut"
                }}
                style={{ originX: 0 }}
              />
              <motion.div
                className="h-2 w-3/4 rounded-full bg-violet-800/30"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  duration: 0.5,
                  delay: 0.5,
                  repeat: Infinity,
                  repeatDelay: 4.4,
                  ease: "easeOut"
                }}
                style={{ originX: 0 }}
              />
            </div>
            <motion.div
              className="mt-2 rounded-md bg-violet-900/40 px-2.5 py-2 ring-1
                ring-violet-500/10"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: [0, 1, 1, 0], y: [4, 0, 0, -2] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                times: [0, 0.2, 0.8, 1],
                ease: "easeInOut"
              }}
            >
              <p className="text-xs font-medium text-violet-200 italic">
                &ldquo;Beef Tenderloin...&rdquo;
              </p>
            </motion.div>
          </div>
        </div>

        {/* Language pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {["EN", "FR", "DE", "IT", "PT", "JA", "ZH"].map((lang, i) => (
            <motion.span
              key={lang}
              className="rounded-full bg-white/6 px-2 py-0.5 text-[10px]
                font-semibold text-taupe-300 ring-1 ring-white/6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: i * 0.12,
                repeat: Infinity,
                repeatDelay: 6,
                duration: 0.3
              }}
            >
              {lang}
            </motion.span>
          ))}
        </div>
      </div>
    </BrowserChrome>
  )
}

/* ------------------------------------------------------------------ */
/*  Feature row component                                             */
/* ------------------------------------------------------------------ */

function FeatureRow({
  icon: Icon,
  accent,
  title,
  description,
  illustration,
  reverse,
  delay
}: {
  icon: typeof ScanText
  accent: string
  title: string
  description: string
  illustration: React.ReactNode
  reverse?: boolean
  delay: number
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <div
      ref={ref}
      className={`grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16
        ${reverse ? "lg:direction-rtl" : ""}`}
    >
      {/* Text block */}
      <motion.div
        className={`lg:direction-ltr flex flex-col gap-5
          ${reverse ? "lg:order-2" : ""}`}
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={{
          duration: 0.6,
          delay,
          ease: [0.21, 0.47, 0.32, 0.98],
          type: "spring"
        }}
      >
        <div
          className={`flex size-12 items-center justify-center rounded-2xl
            ${accent}`}
        >
          <Icon className="size-6" />
        </div>
        <h3
          className="font-display text-2xl font-semibold tracking-tighter
            text-taupe-50 sm:text-3xl"
        >
          {title}
        </h3>
        <p
          className="max-w-lg text-lg leading-relaxed text-balance
            text-taupe-300"
        >
          {description}
        </p>
      </motion.div>

      {/* Illustration block */}
      <motion.div
        className={`lg:direction-ltr aspect-4/3 ${reverse ? "lg:order-1" : ""}`}
        initial={{ opacity: 0, y: 32 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
        transition={{
          duration: 0.8,
          delay: delay + 0.15,
          ease: [0.21, 0.47, 0.32, 0.98],
          type: "spring"
        }}
      >
        {illustration}
      </motion.div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main section                                                      */
/* ------------------------------------------------------------------ */

export default function AIFeatures() {
  return (
    <section
      id="ai-features"
      className="relative overflow-hidden bg-taupe-950 py-20 sm:py-32"
    >
      {/* Subtle gradient backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 100% 70% at 20% 30%, oklch(25% 0.01 34.3 / 0.5), transparent 55%),
            radial-gradient(ellipse 80% 60% at 80% 60%, oklch(20% 0.008 39.5 / 0.4), transparent 50%)
          `
        }}
      />

      <div
        className="relative z-10 mx-auto max-w-6xl space-y-20 px-4 sm:space-y-28
          sm:px-6 lg:px-8"
      >
        {/* Section header */}
        <TitleSection
          align="left"
          eyebrow="Automatización con IA"
          title="Tu menú, listo en menos tiempo."
          tagline="Sube una foto o un PDF y deja que la IA convierta tu menú en contenido editable para que puedas enfocarte en atender a tus clientes."
          inverted
        />

        {/* Feature 1 — Instant digitisation */}
        <FeatureRow
          icon={ScanText}
          accent="bg-orange-500/20 text-orange-400"
          title="Digitaliza tu menú en segundos"
          description="Sube un PDF o una foto de tu menú impreso y la IA detecta platillos, precios y descripciones para convertirlos en contenido editable."
          illustration={<ScannerIllustration />}
          delay={0.1}
        />

        {/* Feature 2 — Automatic translation */}
        <FeatureRow
          icon={Languages}
          accent="bg-violet-500/20 text-violet-400"
          title="Traducción para cada cliente"
          description="Traduce tu menú a varios idiomas para que cada comensal entienda lo que ofreces y se sienta bien atendido."
          illustration={<TranslationIllustration />}
          reverse
          delay={0.1}
        />
      </div>
    </section>
  )
}
