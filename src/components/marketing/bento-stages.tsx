"use client"

import { QRCode } from "react-qrcode-logo"
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  Copy,
  Globe,
  QrCodeIcon
} from "lucide-react"

import {
  Button,
  Count,
  Spinner,
  Stage,
  States,
  Toast,
  Toggle,
  type Act,
  type Layout
} from "@/components/marketing/stageshow-kit"

import "./stageshow-biztro.css"

/* ------------------------------------------------------------------ */
/*  Editor: edit a price, the pending dot appears, publish, toast     */
/* ------------------------------------------------------------------ */

type PublishState = {
  price: number
  selected: boolean
  dirty: boolean
  pressed: boolean
  publishing: boolean
  toast: boolean
}

const publishInitial: PublishState = {
  price: 68,
  selected: false,
  dirty: false,
  pressed: false,
  publishing: false,
  toast: false
}

const publishPoster: PublishState = {
  ...publishInitial,
  price: 72,
  toast: true
}

async function publishCycle(a: Act<PublishState>, price: number) {
  await a.set({ selected: true })
  await a.wait(550)
  await a.set({ price })
  await a.wait(900)
  await a.set({ selected: false, dirty: true })
  await a.wait(1300)
  await a.set({ pressed: true })
  await a.wait(140)
  await a.set({ pressed: false, publishing: true })
  await a.wait(1400)
  await a.set({ publishing: false, dirty: false, toast: true })
  await a.wait(2200)
  await a.set({ toast: false })
  await a.wait(900)
}

async function publishScript(a: Act<PublishState>) {
  await a.wait(700)
  await publishCycle(a, 72)
  await publishCycle(a, 68)
}

export function PublishStage() {
  return (
    <Stage<PublishState>
      width={536}
      height={180}
      compact={{ below: 440, width: 358, height: 196 }}
      theme="dark"
      initial={publishInitial}
      poster={publishPoster}
      script={publishScript}
      className="bp-stage"
    >
      {(s, _rect, layout: Layout) => {
        const compact = layout === "compact"
        return (
          <div className="bp-scene" data-compact={compact || undefined}>
            <div className="bp-card">
              <div className="bp-header">
                <div className="bp-title">
                  {!compact && <ChevronLeft className="bp-back" size={15} />}
                  <span>Menú de temporada</span>
                  <ChevronDown size={12} className="bp-title-chevron" />
                </div>
                <div className="bp-actions">
                  {!compact && (
                    <Button
                      variant="ghost"
                      size="small"
                      icon={<Check size={14} />}
                    />
                  )}
                  <Button
                    variant="ghost"
                    size="small"
                    icon={<QrCodeIcon size={14} />}
                  />
                  <span className="bp-sep" />
                  <span className="bp-publish">
                    <Button
                      variant="primary"
                      size="small"
                      data-pressed={s.pressed || undefined}
                      icon={
                        s.publishing ? (
                          <Spinner size={11} className="bp-spinner" />
                        ) : undefined
                      }
                    >
                      {s.publishing ? "Publicando…" : "Publicar"}
                    </Button>
                    <span className="bp-dot" data-on={s.dirty || undefined} />
                  </span>
                </div>
              </div>
              <div className="bp-canvas">
                <div className="bp-paper">
                  <span className="bp-section">Bebidas calientes</span>
                  <div
                    className="bp-item"
                    data-selected={s.selected || undefined}
                  >
                    <div className="bp-item-text">
                      <span className="bp-item-name">Latte de vainilla</span>
                      <span className="bp-line" style={{ width: "78%" }} />
                    </div>
                    <Count
                      value={s.price}
                      format={n => `$${Math.round(n)}`}
                      className="bp-price"
                    />
                  </div>
                  <div className="bp-item bp-item--filler">
                    <div className="bp-item-text">
                      <span className="bp-line bp-line--name" />
                      <span className="bp-line" style={{ width: "64%" }} />
                    </div>
                    <span className="bp-line bp-line--price" />
                  </div>
                </div>
              </div>
            </div>
            <Toast
              show={s.toast}
              className="bp-toast"
              icon={<CheckCircle2 size={15} />}
            >
              Menú actualizado
            </Toast>
          </div>
        )
      }}
    </Stage>
  )
}

/* ------------------------------------------------------------------ */
/*  QR dialog: logo on, brand color, copy the link, then back         */
/* ------------------------------------------------------------------ */

type QrFocus = "logo" | "color" | "copy" | null

type QrState = {
  logo: boolean
  brand: boolean
  copied: boolean
  focus: QrFocus
}

const qrInitial: QrState = {
  logo: false,
  brand: false,
  copied: false,
  focus: null
}

const qrPoster: QrState = { ...qrInitial, logo: true, brand: true }

async function qrScript(a: Act<QrState>) {
  await a.wait(900)
  await a.set({ focus: "logo" })
  await a.wait(260)
  await a.set({ logo: true })
  await a.wait(500)
  await a.set({ focus: null })
  await a.wait(1100)
  await a.set({ focus: "color" })
  await a.wait(260)
  await a.set({ brand: true })
  await a.wait(500)
  await a.set({ focus: null })
  await a.wait(1100)
  await a.set({ focus: "copy" })
  await a.wait(260)
  await a.set({ copied: true })
  await a.wait(500)
  await a.set({ focus: null })
  await a.wait(1900)
  await a.set({ copied: false })
  await a.wait(500)
  await a.set({ focus: "color" })
  await a.wait(260)
  await a.set({ brand: false })
  await a.wait(500)
  await a.set({ focus: null })
  await a.wait(700)
  await a.set({ focus: "logo" })
  await a.wait(260)
  await a.set({ logo: false })
  await a.wait(500)
  await a.set({ focus: null })
  await a.wait(900)
}

const QR_VALUE = "https://nomada.biztro.co"
const QR_DARK = "#1c1917"
const QR_BRAND = "#ea580c"

const EYE_RADIUS = {
  outer: [10, 10, 10, 10] as [number, number, number, number],
  inner: [3, 3, 3, 3] as [number, number, number, number]
}

function QrLayer({
  size,
  logo,
  color,
  on
}: {
  size: number
  logo: boolean
  color: string
  on: boolean
}) {
  const logoWidth = Math.round(size * 0.22)
  return (
    <span className="bq-qr-layer" data-on={on || undefined}>
      <QRCode
        value={QR_VALUE}
        size={size}
        quietZone={0}
        ecLevel={logo ? "H" : "M"}
        logoImage={logo ? "/logo-bistro.svg" : undefined}
        logoWidth={logo ? logoWidth : 0}
        logoPadding={logo ? 3 : 0}
        logoPaddingStyle="circle"
        removeQrCodeBehindLogo={logo}
        fgColor={color}
        qrStyle="dots"
        eyeRadius={[EYE_RADIUS, EYE_RADIUS, EYE_RADIUS]}
      />
    </span>
  )
}

export function QrStage() {
  return (
    <Stage<QrState>
      width={536}
      height={260}
      compact={{ below: 440, width: 358, height: 260 }}
      theme="light"
      initial={qrInitial}
      poster={qrPoster}
      script={qrScript}
      className="bq-stage"
    >
      {(s, _rect, layout: Layout) => {
        const compact = layout === "compact"
        const size = compact ? 100 : 118
        const variant = !s.logo ? "plain" : s.brand ? "brand" : "logo"
        return (
          <div className="bq-scene" data-compact={compact || undefined}>
            <div className="bq-dialog">
              <span className="bq-title">Generar código QR</span>
              <span className="bq-desc" />
              <div className="bq-body">
                <div className="bq-qr">
                  <QrLayer
                    size={size}
                    logo={false}
                    color={QR_DARK}
                    on={variant === "plain"}
                  />
                  <QrLayer
                    size={size}
                    logo
                    color={QR_DARK}
                    on={variant === "logo"}
                  />
                  <QrLayer
                    size={size}
                    logo
                    color={QR_BRAND}
                    on={variant === "brand"}
                  />
                </div>
                <div className="bq-side">
                  <div
                    className="bq-url"
                    data-focus={s.focus === "copy" || undefined}
                  >
                    <Globe size={13} className="bq-url-globe" />
                    <span className="bq-url-text">nomada.biztro.co</span>
                    <span className="bq-copy" data-on={s.copied || undefined}>
                      <States
                        value={s.copied ? "done" : "copy"}
                        states={{
                          copy: <Copy size={13} />,
                          done: <Check size={13} />
                        }}
                      />
                    </span>
                  </div>
                  <div className="bq-fieldset">
                    <span className="bq-legend">Ajustes</span>
                    <div
                      className="bq-setting"
                      data-focus={s.focus === "color" || undefined}
                    >
                      <span>Color</span>
                      <span
                        className="bq-swatch"
                        style={{ background: s.brand ? QR_BRAND : QR_DARK }}
                      />
                    </div>
                    <div
                      className="bq-setting"
                      data-focus={s.focus === "logo" || undefined}
                    >
                      <span>Mostrar logo</span>
                      <Toggle on={s.logo} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }}
    </Stage>
  )
}
