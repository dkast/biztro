"use client"

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
  type RefObject
} from "react"
import type { Transition } from "motion/react"

export const pieCssVars = {
  background: "var(--chart-background)",
  foreground: "var(--chart-foreground)",
  foregroundMuted: "var(--chart-foreground-muted)",
  label: "var(--chart-label)",
  slice1: "var(--chart-1)",
  slice2: "var(--chart-2)",
  slice3: "var(--chart-3)",
  slice4: "var(--chart-4)",
  slice5: "var(--chart-5)"
}

export const defaultPieColors = [
  pieCssVars.slice1,
  pieCssVars.slice2,
  pieCssVars.slice3,
  pieCssVars.slice4,
  pieCssVars.slice5
]

export interface PieData {
  label: string
  value: number
  color?: string
  fill?: string
}

export interface PieArcData {
  data: PieData
  index: number
  startAngle: number
  endAngle: number
  padAngle: number
  value: number
}

export interface PieHoverContextValue {
  hoveredIndex: number | null
  setHoveredIndex: (index: number | null) => void
}

export interface PieStableContextValue {
  data: PieData[]
  arcs: PieArcData[]
  size: number
  center: number
  outerRadius: number
  innerRadius: number
  padAngle: number
  cornerRadius: number
  hoverOffset: number
  animationKey: number
  isLoaded: boolean
  enterTransition?: Transition
  enterStaggerScale: number
  containerRef: RefObject<HTMLDivElement | null>
  totalValue: number
  getColor: (index: number) => string
  getFill: (index: number) => string
  geometryScrubbing: boolean
  scrubSlicePaths: readonly string[] | null
}

export type PieContextValue = PieStableContextValue & PieHoverContextValue

const PieStableContext = createContext<PieStableContextValue | null>(null)
const PieHoverContext = createContext<PieHoverContextValue | null>(null)

export function PieProvider({
  children,
  value
}: {
  children: ReactNode
  value: PieContextValue
}) {
  const stable = useMemo<PieStableContextValue>(
    () => ({
      data: value.data,
      arcs: value.arcs,
      size: value.size,
      center: value.center,
      outerRadius: value.outerRadius,
      innerRadius: value.innerRadius,
      padAngle: value.padAngle,
      cornerRadius: value.cornerRadius,
      hoverOffset: value.hoverOffset,
      animationKey: value.animationKey,
      isLoaded: value.isLoaded,
      enterTransition: value.enterTransition,
      enterStaggerScale: value.enterStaggerScale,
      containerRef: value.containerRef,
      totalValue: value.totalValue,
      getColor: value.getColor,
      getFill: value.getFill,
      geometryScrubbing: value.geometryScrubbing,
      scrubSlicePaths: value.scrubSlicePaths
    }),
    [
      value.data,
      value.arcs,
      value.size,
      value.center,
      value.outerRadius,
      value.innerRadius,
      value.padAngle,
      value.cornerRadius,
      value.hoverOffset,
      value.animationKey,
      value.isLoaded,
      value.enterTransition,
      value.enterStaggerScale,
      value.containerRef,
      value.totalValue,
      value.getColor,
      value.getFill,
      value.geometryScrubbing,
      value.scrubSlicePaths
    ]
  )

  const hover = useMemo<PieHoverContextValue>(
    () => ({
      hoveredIndex: value.hoveredIndex,
      setHoveredIndex: value.setHoveredIndex
    }),
    [value.hoveredIndex, value.setHoveredIndex]
  )

  return (
    <PieStableContext.Provider value={stable}>
      <PieHoverContext.Provider value={hover}>
        {children}
      </PieHoverContext.Provider>
    </PieStableContext.Provider>
  )
}

export function usePieStable(): PieStableContextValue {
  const context = useContext(PieStableContext)

  if (!context) {
    throw new Error(
      "usePieStable must be used within a PieProvider. Make sure your component is wrapped in <PieChart>."
    )
  }

  return context
}

export function usePieHover(): PieHoverContextValue {
  const context = useContext(PieHoverContext)

  if (!context) {
    throw new Error(
      "usePieHover must be used within a PieProvider. Make sure your component is wrapped in <PieChart>."
    )
  }

  return context
}

export function usePie(): PieContextValue {
  return { ...usePieStable(), ...usePieHover() }
}

export default PieStableContext
