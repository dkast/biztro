"use client"

import { useRef } from "react"
import { Languages, ScanText } from "lucide-react"
import { motion, useInView } from "motion/react"

import {
  Badge,
  Bar,
  Collapse,
  Icon,
  Meter,
  Spinner,
  Stage,
  States,
  Window,
  type Act,
  type Layout,
  type Point
} from "@/components/marketing/stageshow-kit"
import TitleSection from "@/components/marketing/title-section"
import { LanguageFlag } from "@/components/ui/language-flag"
import { cn } from "@/lib/utils"

import "./stageshow-biztro.css"

/* ------------------------------------------------------------------ */
/*  Scene 1: Printed menu PDF dragged in -> structured editable rows  */
/* ------------------------------------------------------------------ */

type DragGhost = {
  on: boolean
  dropped: boolean
  off: Point
  at: Point
}

type ImportState = {
  over: boolean
  phase: "idle" | "parsing" | "done"
  progress: number
  rowsOpen: number
  ghost: DragGhost
}

const importInitial: ImportState = {
  over: false,
  phase: "idle",
  progress: 0,
  rowsOpen: 0,
  ghost: {
    on: false,
    dropped: false,
    off: { x: 0, y: 0 },
    at: { x: 0, y: 0 }
  }
}

const importPoster: ImportState = {
  over: false,
  phase: "done",
  progress: 1,
  rowsOpen: 3,
  ghost: {
    on: false,
    dropped: true,
    off: { x: 0, y: 0 },
    at: { x: 0, y: 0 }
  }
}

const IMPORT_ITEMS = [
  {
    name: "Enchiladas suizas",
    category: "Platos fuertes",
    price: "$135",
    score: "98%"
  },
  {
    name: "Molletes clásicos",
    category: "Desayunos",
    price: "$95",
    score: "96%"
  },
  {
    name: "Café de olla",
    category: "Bebidas",
    price: "$45",
    score: "99%"
  }
] as const

async function importScript(a: Act<ImportState>) {
  await a.wait(650)

  // 1. Pick up the printed menu PDF
  const icon = a.rect("pdf-icon")
  const file = a.rect("pdf-file")
  const grab = {
    x: icon.x + icon.width * 0.55,
    y: icon.y + icon.height * 0.55
  }
  await a.move(grab)
  await a.wait(220)
  const off = { x: grab.x - file.x, y: grab.y - file.y }

  // 2. Drag it into the import window
  const drop = a.rect("import-drop")
  const target = {
    x: drop.x + drop.width * 0.42,
    y: drop.y + drop.height * 0.36
  }
  await a.drag(
    target,
    (at, _from, p) => {
      a.put({
        over: p > 0.45,
        ghost: { on: true, dropped: false, off, at }
      })
    },
    { duration: 1150, cursor: "preserve" }
  )

  // 3. Drop: parse progress and rows open top-to-bottom
  await a.set(s => ({
    over: false,
    phase: "parsing",
    progress: 0.25,
    ghost: { ...s.ghost, dropped: true }
  }))
  await a.wait(420)
  await a.set({ progress: 0.65, rowsOpen: 1 })
  await a.wait(420)
  await a.set({ progress: 0.9, rowsOpen: 2 })
  await a.wait(420)
  await a.set({ phase: "done", progress: 1, rowsOpen: 3 })

  // 4. Hold the structured result
  await a.wait(2400)

  // 5. Caused reset: Cmd+Z clears the imported batch
  await a.key("cmd+z")
  await a.set({
    rowsOpen: 0,
    phase: "idle",
    ghost: importInitial.ghost
  })
  await a.wait(620)
  await a.snap({ progress: 0 })
  await a.wait(320)
}

function PdfThumb({ small }: { small?: boolean }) {
  return (
    <div className={small ? "ai-pdf-doc ai-pdf-doc--small" : "ai-pdf-doc"}>
      {!small && <span className="ai-pdf-badge">PDF</span>}
      <Bar w={small ? 18 : 38} h={small ? 3 : 4} r={2} tone={4} />
      <Bar w={small ? 14 : 30} h={small ? 2 : 3} r={1.5} tone={3} />
      <Bar w={small ? 16 : 34} h={small ? 2 : 3} r={1.5} tone={2} />
      {!small && <Bar w={24} h={3} r={1.5} tone={2} />}
    </div>
  )
}

function MenuImportStage() {
  return (
    <Stage<ImportState>
      width={512}
      height={380}
      compact={{ below: 440, width: 358, height: 348 }}
      theme="dark"
      initial={importInitial}
      poster={importPoster}
      play="loop"
      script={importScript}
      keys={{ wide: "bottom-left", compact: "top" }}
      cursor={{
        at: { at: "import-drop", x: 0.42, y: 0.36 }
      }}
      className="ai-stage"
    >
      {(s, _rect, layout: Layout) => {
        const compact = layout === "compact"
        const lifted = s.ghost.on && !s.ghost.dropped
        const winStyle = compact
          ? { left: 14, top: 68, width: 360, height: 304 }
          : { left: 112, top: 20, width: 418, height: 384 }

        return (
          <>
            <div
              className={
                compact ? "ai-desk-file ai-desk-file--compact" : "ai-desk-file"
              }
              data-target="pdf-file"
              data-lifted={lifted || undefined}
              style={compact ? { left: 14, top: 12 } : { left: 14, top: 106 }}
            >
              <span data-target="pdf-icon">
                <PdfThumb small={compact} />
              </span>
              <span className="ai-pdf-name">carta-impresa.pdf</span>
            </div>

            <Window
              url="biztro.co/menu-items/menu-import"
              className="ai-window"
              style={winStyle}
            >
              <div
                className="ai-import-body"
                data-target="import-drop"
                data-over={s.over || undefined}
                data-compact={compact || undefined}
              >
                <div className="ai-import-head">
                  <div className="ai-import-title">Importar menú</div>
                  <States
                    value={s.phase}
                    align="end"
                    states={{
                      idle: (
                        <span className="ai-import-status">
                          {compact
                            ? "Arrastra un PDF"
                            : "Arrastra un PDF o foto"}
                        </span>
                      ),
                      parsing: (
                        <span className="ai-import-status">
                          <Spinner size={12} />
                          <Meter
                            value={s.progress}
                            className="ai-import-meter"
                          />
                        </span>
                      ),
                      done: (
                        <Badge
                          tone="success"
                          icon={<Icon name="check" size={12} />}
                        >
                          3 platillos listos
                        </Badge>
                      )
                    }}
                  />
                </div>

                <div className="ai-table" data-compact={compact || undefined}>
                  <div className="ai-table-head">
                    <span>Platillo</span>
                    {!compact && <span>Categoría</span>}
                    <span style={{ textAlign: "right" }}>Precio</span>
                    <span style={{ textAlign: "right" }}>Exact.</span>
                  </div>

                  {IMPORT_ITEMS.map((item, idx) => (
                    <Collapse
                      key={item.name}
                      open={s.rowsOpen > idx}
                      reveal="drop"
                    >
                      <div className="ai-table-row">
                        <span className="ai-dish-name">{item.name}</span>
                        {!compact && (
                          <span className="ai-dish-cat">{item.category}</span>
                        )}
                        <span className="ai-dish-price">{item.price}</span>
                        <span className="ai-score-cell">
                          <Badge tone="success">{item.score}</Badge>
                        </span>
                      </div>
                    </Collapse>
                  ))}

                  {/* Quiet filler rows keep the table grounded before & after */}
                  {[112, 86, 128].map((w, idx) => (
                    <div key={idx} className="ai-table-row">
                      <Bar w={w} h={7} r={3.5} tone={2} />
                      {!compact && <Bar w={64} h={6} r={3} tone={1} />}
                      <div style={{ display: "flex", justifyContent: "end" }}>
                        <Bar w={32} h={7} r={3.5} tone={2} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "end" }}>
                        <Bar w={34} h={16} r={8} tone={1} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Window>

            {s.ghost.on && (
              <div
                className="ai-drag-ghost"
                style={{
                  opacity: s.ghost.dropped ? 0 : 1,
                  transform: `translate3d(${s.ghost.at.x - s.ghost.off.x}px, ${s.ghost.at.y - s.ghost.off.y}px, 0) scale(1.03) rotate(-1.5deg)`
                }}
              >
                <PdfThumb small />
                <span className="ai-pdf-name">carta-impresa.pdf</span>
              </div>
            )}
          </>
        )
      }}
    </Stage>
  )
}

/* ------------------------------------------------------------------ */
/*  Scene 2: One menu, every language (cursor-driven language tabs)   */
/* ------------------------------------------------------------------ */

const LOCALES = [
  {
    code: "es",
    label: "Español",
    short: "ES",
    dish: "Tacos al pastor",
    description:
      "Tortillas de maíz con cerdo marinado, piña asada, cebolla y cilantro.",
    drink: "Agua de horchata",
    status: "Idioma original"
  },
  {
    code: "en",
    label: "Inglés",
    short: "EN",
    dish: "Pork tacos al pastor",
    description:
      "Corn tortillas with marinated pork, roasted pineapple, onion and cilantro.",
    drink: "Horchata rice drink",
    status: "Inglés · 24 platillos"
  },
  {
    code: "fr",
    label: "Francés",
    short: "FR",
    dish: "Tacos al pastor",
    description:
      "Tortillas de maïs, porc mariné, ananas rôti, oignon et coriandre.",
    drink: "Boisson horchata",
    status: "Francés · 24 platillos"
  },
  {
    code: "ja",
    label: "Japonés",
    short: "JA",
    dish: "タコス・アル・パストール",
    description:
      "マリネした豚肉、焼きパイナップル、玉ねぎ、コリアンダーのトルティーヤ。",
    drink: "オルチャタ（お米のドリンク）",
    status: "Japonés · 24 platillos"
  }
] as const

type LocaleIndex = 0 | 1 | 2 | 3
type TranslationState = { index: LocaleIndex }

const transInitial: TranslationState = { index: 0 }
const transPoster: TranslationState = { index: 1 }

async function translationScript(a: Act<TranslationState>) {
  await a.wait(850)

  for (const next of [1, 2, 3] as const) {
    const target = `lang-${next}`
    await a.move({ at: target, x: 0.78, y: 0.62 })
    await a.click({ at: target, x: 0.78, y: 0.62 })
    await a.set({ index: next })
    await a.wait(next === 3 ? 2100 : 1850)
  }

  // Caused reset: return to Español
  await a.move({ at: "lang-0", x: 0.78, y: 0.62 })
  await a.click({ at: "lang-0", x: 0.78, y: 0.62 })
  await a.set({ index: 0 })
  await a.wait(500)
}

function TranslationStage() {
  return (
    <Stage<TranslationState>
      width={512}
      height={380}
      compact={{ below: 440, width: 358, height: 358 }}
      theme="dark"
      initial={transInitial}
      poster={transPoster}
      play="loop"
      script={translationScript}
      cursor={{ at: { at: "lang-0", x: 0.78, y: 0.62 } }}
      className="ai-stage"
    >
      {(s, _rect, layout: Layout) => {
        const compact = layout === "compact"
        const winStyle = compact
          ? { left: 14, top: 14, width: 360, height: 366 }
          : { left: 20, top: 20, width: 510, height: 384 }

        const dishStates = Object.fromEntries(
          LOCALES.map((loc, i) => [
            String(i),
            <span key={loc.code} className="ai-dish-card__title">
              {loc.dish}
            </span>
          ])
        )

        const descStates = Object.fromEntries(
          LOCALES.map((loc, i) => [
            String(i),
            <span key={loc.code} className="ai-dish-card__desc">
              {loc.description}
            </span>
          ])
        )

        const drinkStates = Object.fromEntries(
          LOCALES.map((loc, i) => [
            String(i),
            <span key={loc.code} className="ai-secondary-row__name">
              {loc.drink}
            </span>
          ])
        )

        const statusStates = Object.fromEntries(
          LOCALES.map((loc, i) => [
            String(i),
            <span key={loc.code}>{loc.status}</span>
          ])
        )

        return (
          <Window
            url="biztro.co/menu-items/translations"
            className="ai-window"
            style={winStyle}
          >
            <div className="ai-trans-body" data-compact={compact || undefined}>
              <div className="ai-lang-bar">
                <span
                  className="ai-lang-pill"
                  style={{
                    transform: `translateX(calc(${s.index} * (100% + 4px)))`
                  }}
                />
                {LOCALES.map((loc, i) => (
                  <button
                    key={loc.code}
                    type="button"
                    tabIndex={-1}
                    aria-hidden="true"
                    className="ai-lang-btn"
                    data-target={`lang-${i}`}
                    data-cursor="pointer"
                    data-active={s.index === i || undefined}
                  >
                    {loc.code === "es" ? (
                      <span className="ai-es-chip">ES</span>
                    ) : (
                      <LanguageFlag
                        locale={loc.code}
                        className="size-4 shrink-0 rounded-full"
                      />
                    )}
                    <span>{compact ? loc.short : loc.label}</span>
                  </button>
                ))}
              </div>

              <div className="ai-dish-card">
                <div className="ai-dish-card__main">
                  <div className="ai-dish-card__head">
                    <States
                      value={String(s.index)}
                      align="start"
                      states={dishStates}
                    />
                    <span className="ai-dish-card__price">$85</span>
                  </div>
                  <States
                    value={String(s.index)}
                    align="start"
                    states={descStates}
                  />
                </div>
                <div className="ai-dish-card__foot">
                  <States
                    value={String(s.index)}
                    align="start"
                    states={statusStates}
                  />
                  <Badge tone="success" icon={<Icon name="check" size={12} />}>
                    Publicado
                  </Badge>
                </div>
              </div>

              <div className="ai-secondary-row">
                <States
                  value={String(s.index)}
                  align="start"
                  states={drinkStates}
                />
                <span className="ai-secondary-row__price">$35</span>
              </div>

              <div className="ai-filler-row">
                <Bar w={132} h={7} r={3.5} tone={2} />
                <Bar w={36} h={7} r={3.5} tone={1} />
              </div>
            </div>
          </Window>
        )
      }}
    </Stage>
  )
}

/* ------------------------------------------------------------------ */
/*  Feature row component                                             */
/* ------------------------------------------------------------------ */

function FeatureRow({
  icon: IconComponent,
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
            <IconComponent className="size-6" />
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
        className={cn("w-full", reverse && "lg:order-1")}
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
      className="biztro-ai relative overflow-hidden bg-taupe-950 py-20 sm:py-28
        lg:py-32"
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
            illustration={<MenuImportStage />}
            delay={0.1}
          />

          <FeatureRow
            icon={Languages}
            step="Traducir"
            title="Traducción para cada cliente"
            description="Traduce tu menú a varios idiomas para que cada comensal entienda lo que ofreces y se sienta bien atendido."
            illustration={<TranslationStage />}
            reverse
            delay={0.1}
          />
        </div>
      </div>
    </section>
  )
}
