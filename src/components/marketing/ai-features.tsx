"use client"

import { useEffect, useRef, useState } from "react"
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Languages,
  LockIcon,
  ScanText,
  Sparkles
} from "lucide-react"
import { AnimatePresence, motion, useInView } from "motion/react"

import TitleSection from "@/components/marketing/title-section"
import { LanguageFlag } from "@/components/ui/language-flag"
import { cn } from "@/lib/utils"

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
      <div
        className="flex items-center gap-2 border-b border-white/6 px-3.5
          py-2.5"
      >
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="ml-2 flex items-center gap-0.5 text-taupe-500">
          <ChevronLeft className="size-3.5" />
          <ChevronRight className="size-3.5" />
        </div>
        <div
          className="mx-2 flex flex-1 items-center justify-center gap-2
            rounded-md bg-taupe-950/60 px-3 py-1 ring-1 ring-white/6"
        >
          <LockIcon className="size-3 text-taupe-700" />
          <span className="truncate text-[11px] text-taupe-400">{url}</span>
        </div>
        <div className="w-20" />
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div className="absolute inset-0 h-full w-full">{children}</div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Illustration 1: printed menu -> structured products               */
/* ------------------------------------------------------------------ */

const SCAN_CYCLE = 9

const extractedItems = [
  { name: "Tacos al pastor", price: "$85", category: "Tacos" },
  { name: "Enchiladas verdes", price: "$120", category: "Platos fuertes" },
  { name: "Agua de horchata", price: "$35", category: "Bebidas" }
]

function ScannerIllustration() {
  return (
    <BrowserChrome url="biztro.co/menu-items/menu-import">
      <div className="grid h-full w-full grid-cols-[1fr_auto_1.15fr] gap-3 p-5">
        {/* Source: photo of the printed menu */}
        <div className="relative flex min-h-0 flex-col">
          <span
            className="mb-2 text-[10px] font-medium tracking-wider
              text-taupe-500 uppercase"
          >
            Menú impreso
          </span>
          <div
            className="relative min-h-0 flex-1 overflow-hidden rounded-md
              bg-[oklch(96%_0.01_80)] shadow-lg ring-1 ring-black/10"
          >
            {/* Paper skeleton */}
            <div className="space-y-3 px-3.5 pt-4 pb-5">
              <div className="flex flex-col items-center gap-1 pb-2">
                <div className="h-2.5 w-16 rounded-sm bg-taupe-400/60" />
                <div className="h-1.5 w-10 rounded-sm bg-taupe-300/70" />
              </div>
              {[0, 1, 2].map(i => (
                <div key={i} className="space-y-1.5">
                  <div className="h-1.5 w-12 rounded-sm bg-taupe-400/50" />
                  <div className="flex items-end gap-2">
                    <div className="h-1.5 flex-1 rounded-sm bg-taupe-300/70" />
                    <div className="h-1.5 w-6 rounded-sm bg-taupe-400/60" />
                  </div>
                  <div className="h-1.5 w-4/5 rounded-sm bg-taupe-300/50" />
                </div>
              ))}
            </div>

            {/* Corner brackets */}
            <div className="pointer-events-none absolute inset-2">
              {[
                "top-0 left-0 border-t-2 border-l-2",
                "top-0 right-0 border-t-2 border-r-2",
                "bottom-0 left-0 border-b-2 border-l-2",
                "right-0 bottom-0 border-r-2 border-b-2"
              ].map(pos => (
                <span
                  key={pos}
                  className={cn(
                    "absolute size-3.5 rounded-[2px] border-orange-500",
                    pos
                  )}
                />
              ))}
            </div>

            {/* Scan line + glow */}
            <motion.div
              className="absolute inset-x-0 h-px bg-linear-to-r from-transparent
                via-orange-500 to-transparent"
              animate={{ top: ["6%", "94%"] }}
              transition={{
                duration: SCAN_CYCLE * 0.55,
                repeat: Infinity,
                repeatDelay: SCAN_CYCLE * 0.45,
                ease: "linear"
              }}
            />
            <motion.div
              className="absolute inset-x-0 h-10 -translate-y-full
                bg-linear-to-b from-transparent to-orange-500/15"
              animate={{ top: ["6%", "94%"] }}
              transition={{
                duration: SCAN_CYCLE * 0.55,
                repeat: Infinity,
                repeatDelay: SCAN_CYCLE * 0.45,
                ease: "linear"
              }}
            />
          </div>
        </div>

        {/* Connector */}
        <div className="flex items-center">
          <motion.div
            className="flex size-7 items-center justify-center rounded-full
              bg-orange-500/15 ring-1 ring-orange-500/30"
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="size-3.5 text-orange-400" />
          </motion.div>
        </div>

        {/* Target: extracted, editable products */}
        <div className="flex min-h-0 flex-col">
          <span
            className="mb-2 text-[10px] font-medium tracking-wider
              text-taupe-500 uppercase"
          >
            Productos detectados
          </span>
          <div className="flex min-h-0 flex-1 flex-col gap-2">
            {extractedItems.map((item, i) => {
              const start = 0.14 + i * 0.16
              return (
                <motion.div
                  key={item.name}
                  className="flex items-center gap-2.5 rounded-md
                    bg-taupe-800/70 px-3 py-2 ring-1 ring-white/8"
                  animate={{
                    opacity: [0, 0, 1, 1, 0],
                    x: [10, 10, 0, 0, 0]
                  }}
                  transition={{
                    duration: SCAN_CYCLE,
                    repeat: Infinity,
                    ease: "easeOut",
                    times: [0, start, start + 0.05, 0.94, 1]
                  }}
                >
                  <div className="size-7 shrink-0 rounded-sm bg-taupe-700/80" />
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-[11px] font-medium
                        text-taupe-100"
                    >
                      {item.name}
                    </p>
                    <p className="text-[9px] text-taupe-500">{item.category}</p>
                  </div>
                  <span className="text-[11px] font-semibold text-taupe-200">
                    {item.price}
                  </span>
                  <motion.span
                    className="flex size-4 items-center justify-center
                      rounded-full bg-green-500/20 text-green-400"
                    animate={{ scale: [0, 0, 1, 1, 1] }}
                    transition={{
                      duration: SCAN_CYCLE,
                      repeat: Infinity,
                      times: [0, start + 0.06, start + 0.1, 0.94, 1]
                    }}
                  >
                    <Check className="size-2.5" strokeWidth={3} />
                  </motion.span>
                </motion.div>
              )
            })}

            {/* Progress */}
            <div className="mt-auto">
              <div
                className="mb-1.5 flex items-center justify-between text-[10px]
                  text-taupe-400"
              >
                <span className="inline-flex items-center gap-1.5">
                  <ScanText className="size-3 text-orange-400" />
                  Extrayendo productos
                </span>
                <span className="tabular-nums">
                  <motion.span
                    animate={{ opacity: [1, 1, 0, 0, 1] }}
                    transition={{
                      duration: SCAN_CYCLE,
                      repeat: Infinity,
                      times: [0, 0.66, 0.68, 0.98, 1]
                    }}
                  >
                    3
                  </motion.span>
                  /12
                </span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-taupe-800">
                <motion.div
                  className="h-full rounded-full bg-orange-500"
                  animate={{ width: ["0%", "0%", "70%", "70%", "0%"] }}
                  transition={{
                    duration: SCAN_CYCLE,
                    repeat: Infinity,
                    ease: "linear",
                    times: [0, 0.08, 0.6, 0.94, 1]
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </BrowserChrome>
  )
}

/* ------------------------------------------------------------------ */
/*  Illustration 2: one product, every language                       */
/* ------------------------------------------------------------------ */

const translations = [
  {
    locale: "es",
    label: "Español",
    name: "Tacos al pastor",
    description:
      "Tortillas de maíz con cerdo marinado, piña, cebolla y cilantro."
  },
  {
    locale: "en",
    label: "Inglés",
    name: "Pork tacos al pastor",
    description:
      "Corn tortillas with marinated pork, pineapple, onion and cilantro."
  },
  {
    locale: "fr",
    label: "Francés",
    name: "Tacos al pastor",
    description: "Tortillas de maïs, porc mariné, ananas, oignon et coriandre."
  },
  {
    locale: "de",
    label: "Alemán",
    name: "Tacos al Pastor",
    description:
      "Maistortillas mit mariniertem Schwein, Ananas, Zwiebel und Koriander."
  },
  {
    locale: "ja",
    label: "Japonés",
    name: "タコス・アル・パストール",
    description:
      "マリネした豚肉、パイナップル、玉ねぎ、コリアンダーのトルティーヤ。"
  }
]

function TranslationIllustration() {
  const [index, setIndex] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)

  useEffect(() => {
    if (!inView) return
    const timer = setInterval(
      () => setIndex(i => (i + 1) % translations.length),
      2600
    )
    return () => clearInterval(timer)
  }, [inView])

  const active = translations[index]!

  return (
    <BrowserChrome url="biztro.co/menu-items/translations">
      <div ref={ref} className="flex h-full w-full flex-col gap-3 p-5">
        {/* Language tabs */}
        <div
          className="flex items-center gap-1 rounded-lg bg-taupe-950/50 p-1
            ring-1 ring-white/6"
        >
          {translations.map((t, i) => {
            const isActive = i === index
            return (
              <button
                key={t.locale}
                type="button"
                tabIndex={-1}
                aria-hidden="true"
                onClick={() => setIndex(i)}
                className={cn(
                  `relative flex flex-1 items-center justify-center gap-1.5
                  rounded-md px-2 py-1.5 text-[10px] font-medium
                  transition-colors duration-300`,
                  isActive ? "text-taupe-50" : "text-taupe-500"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="lang-tab"
                    className="absolute inset-0 rounded-md bg-taupe-800 ring-1
                      ring-white/10"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {t.locale === "es" ? (
                    <span
                      className="rounded-[3px] bg-taupe-600 px-1 text-[8px]
                        leading-3 font-bold text-taupe-100"
                    >
                      ES
                    </span>
                  ) : (
                    <LanguageFlag
                      locale={t.locale}
                      className="size-3 rounded-full"
                    />
                  )}
                  <span className="hidden sm:inline">{t.label}</span>
                </span>
              </button>
            )
          })}
        </div>

        {/* Product card */}
        <div
          className="relative flex min-h-0 flex-1 flex-col overflow-hidden
            rounded-lg bg-taupe-800/60 ring-1 ring-white/8"
        >
          <div className="flex gap-4 p-4">
            <div
              className="relative size-20 shrink-0 overflow-hidden rounded-md
                bg-taupe-700/80 sm:size-24"
            >
              <span
                className="absolute inset-x-2 bottom-2 h-6 rounded-sm
                  bg-orange-500/30"
              />
              <span
                className="absolute top-2 right-2 size-5 rounded-full
                  bg-taupe-600"
              />
            </div>
            <div className="min-w-0 flex-1">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active.locale}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p
                      className="font-display text-sm font-semibold
                        text-taupe-50 sm:text-base"
                    >
                      {active.name}
                    </p>
                    <span
                      className="shrink-0 text-sm font-semibold text-taupe-200"
                    >
                      $85
                    </span>
                  </div>
                  <p
                    className="mt-1 text-[11px] leading-relaxed text-taupe-400
                      sm:text-xs"
                  >
                    {active.description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Footer status */}
          <div
            className="mt-auto flex items-center justify-between border-t
              border-white/6 px-4 py-2.5"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={active.locale}
                className="inline-flex items-center gap-1.5 text-[10px]
                  text-taupe-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {index === 0 ? (
                  <>
                    <span className="size-1.5 rounded-full bg-taupe-500" />
                    Idioma original
                  </>
                ) : (
                  <>
                    <Sparkles className="size-3 text-orange-400" />
                    Traducido con IA
                  </>
                )}
              </motion.span>
            </AnimatePresence>
            <span
              className="inline-flex items-center gap-1 rounded-sm
                bg-green-500/15 px-1.5 py-0.5 text-[10px] font-medium
                text-green-400"
            >
              <Check className="size-3" strokeWidth={3} />
              Publicado
            </span>
          </div>
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
  step,
  title,
  description,
  illustration,
  reverse,
  delay
}: {
  icon: typeof ScanText
  step: string
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
      className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16"
    >
      <motion.div
        className={cn("flex flex-col gap-5", reverse && "lg:order-2")}
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={{
          duration: 0.6,
          delay,
          ease: [0.21, 0.47, 0.32, 0.98],
          type: "spring"
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex size-12 items-center justify-center rounded-xl
              bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/25"
          >
            <Icon className="size-6" />
          </div>
          <span
            className="text-xs font-semibold tracking-widest text-taupe-500
              uppercase"
          >
            {step}
          </span>
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

      <motion.div
        className={cn("aspect-4/3", reverse && "lg:order-1")}
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
      className="relative overflow-hidden bg-taupe-950 py-20 sm:py-28 lg:py-32"
    >
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 100% 70% at 20% 30%, oklch(25% 0.01 34.3 / 0.5), transparent 55%),
            radial-gradient(ellipse 80% 60% at 80% 60%, oklch(20% 0.008 39.5 / 0.4), transparent 50%)
          `
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <TitleSection
          align="left"
          eyebrow="Automatización con IA"
          title="Tu menú, listo en menos tiempo."
          tagline="Sube una foto o un PDF y deja que la IA convierta tu menú en contenido editable para que puedas enfocarte en atender a tus clientes."
          inverted
        />

        <div className="mt-10 space-y-16 sm:mt-14 sm:space-y-24">
          <FeatureRow
            icon={ScanText}
            step="Importar"
            title="Digitaliza tu menú en segundos"
            description="Sube un PDF o una foto de tu menú impreso y la IA detecta platillos, precios y descripciones para convertirlos en contenido editable."
            illustration={<ScannerIllustration />}
            delay={0.1}
          />

          <FeatureRow
            icon={Languages}
            step="Traducir"
            title="Traducción para cada cliente"
            description="Traduce tu menú a varios idiomas para que cada comensal entienda lo que ofreces y se sienta bien atendido."
            illustration={<TranslationIllustration />}
            reverse
            delay={0.1}
          />
        </div>
      </div>
    </section>
  )
}
