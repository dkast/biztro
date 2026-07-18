"use client"

import {
  Children,
  isValidElement,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode
} from "react"
import { Group } from "@visx/group"
import { ParentSize } from "@visx/responsive"
import { arc as arcGenerator } from "@visx/shape"
import { pie as d3Pie } from "d3-shape"
import type { Transition } from "motion/react"

import { cn } from "@/lib/utils"
import {
  defaultPieColors,
  PieProvider,
  type PieArcData,
  type PieContextValue,
  type PieData
} from "./pie-context"

export const DEFAULT_HOVER_OFFSET = 10

export interface PieChartProps {
  data: PieData[]
  size?: number
  innerRadius?: number
  padAngle?: number
  cornerRadius?: number
  startAngle?: number
  endAngle?: number
  className?: string
  hoveredIndex?: number | null
  onHoverChange?: (index: number | null) => void
  hoverOffset?: number
  children: ReactNode
  enterTransition?: Transition
  enterStaggerScale?: number
  geometryScrubbing?: boolean
}

interface PieChartInnerProps {
  width: number
  height: number
  data: PieData[]
  innerRadius: number
  padAngle: number
  cornerRadius: number
  startAngle: number
  endAngle: number
  hoverOffset: number
  children: ReactNode
  containerRef: React.RefObject<HTMLDivElement | null>
  hoveredIndexProp?: number | null
  onHoverChange?: (index: number | null) => void
  enterTransition?: Transition
  enterStaggerScale: number
  geometryScrubbing: boolean
}

function generatePieArcPath(
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
  cornerRadius: number,
  padAngle: number
): string {
  const generator = arcGenerator<unknown>({
    innerRadius,
    outerRadius,
    cornerRadius,
    padAngle
  })

  return generator({ startAngle, endAngle } as unknown as null) || ""
}

function isPieCenter(child: ReactNode): boolean {
  return (
    isValidElement(child) &&
    typeof child.type === "function" &&
    ((child.type as { displayName?: string }).displayName === "PieCenter" ||
      (child.type as { name?: string }).name === "PieCenter")
  )
}

function isPieSlice(child: ReactNode): boolean {
  return (
    isValidElement(child) &&
    typeof child.type === "function" &&
    ((child.type as { displayName?: string }).displayName === "PieSlice" ||
      (child.type as { name?: string }).name === "PieSlice")
  )
}

function isDefsComponent(child: ReactElement): boolean {
  const displayName =
    (child.type as { displayName?: string })?.displayName ||
    (child.type as { name?: string })?.name ||
    ""

  return (
    displayName.includes("Gradient") ||
    displayName.includes("Pattern") ||
    displayName === "LinearGradient" ||
    displayName === "RadialGradient"
  )
}

function PieChartInner(props: PieChartInnerProps) {
  const size = Math.min(props.width, props.height)

  if (size < 10) {
    return null
  }

  return <PieChartCore {...props} />
}

const PieChartCore = memo(function PieChartCore({
  width,
  height,
  data,
  innerRadius: innerRadiusProp,
  padAngle,
  cornerRadius,
  startAngle,
  endAngle,
  hoverOffset,
  children,
  containerRef,
  hoveredIndexProp,
  onHoverChange,
  enterTransition,
  enterStaggerScale,
  geometryScrubbing
}: PieChartInnerProps) {
  const [internalHoveredIndex, setInternalHoveredIndex] = useState<
    number | null
  >(null)
  const [animationKey] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  const isControlled = hoveredIndexProp !== undefined
  const hoveredIndex = isControlled ? hoveredIndexProp : internalHoveredIndex

  const setHoveredIndex = useCallback(
    (index: number | null) => {
      if (isControlled) {
        onHoverChange?.(index)
      } else {
        setInternalHoveredIndex(index)
      }
    },
    [isControlled, onHoverChange]
  )

  const size = Math.min(width, height)
  const center = size / 2
  const padding = hoverOffset
  const outerRadius = center - padding
  const innerRadius = innerRadiusProp

  const totalValue = useMemo(
    () => data.reduce((sum, item) => sum + item.value, 0),
    [data]
  )

  const getColor = useCallback(
    (index: number) => {
      const item = data[index]
      if (item?.color) {
        return item.color
      }

      return defaultPieColors[index % defaultPieColors.length] as string
    },
    [data]
  )

  const getFill = useCallback(
    (index: number) => {
      const item = data[index]
      if (item?.fill) {
        return item.fill
      }

      return getColor(index)
    },
    [data, getColor]
  )

  const arcs = useMemo(() => {
    const pieGenerator = d3Pie<PieData>()
      .value(item => item.value)
      .startAngle(startAngle)
      .endAngle(endAngle)
      .padAngle(padAngle)
      .sort(null)

    return pieGenerator(data).map((arc, index) => ({
      data: arc.data,
      index,
      startAngle: arc.startAngle,
      endAngle: arc.endAngle,
      padAngle: arc.padAngle,
      value: arc.value
    })) as PieArcData[]
  }, [data, startAngle, endAngle, padAngle])

  const scrubSlicePaths = useMemo((): readonly string[] | null => {
    if (!geometryScrubbing) {
      return null
    }

    return arcs.map(arc =>
      generatePieArcPath(
        innerRadius,
        outerRadius,
        arc.startAngle,
        arc.endAngle,
        cornerRadius,
        arc.padAngle
      )
    )
  }, [geometryScrubbing, arcs, innerRadius, outerRadius, cornerRadius])

  const effectiveIsLoaded = geometryScrubbing || isLoaded

  useEffect(() => {
    if (geometryScrubbing) {
      return
    }

    setIsLoaded(false)
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [enterTransition, enterStaggerScale, geometryScrubbing])

  const { svgChildren, centerChildren, defsChildren } = useMemo(() => {
    const svgNodes: ReactNode[] = []
    const centerNodes: ReactNode[] = []
    const defsNodes: ReactElement[] = []

    Children.forEach(children, child => {
      if (!isValidElement(child)) {
        svgNodes.push(child)
        return
      }

      if (isPieCenter(child)) {
        centerNodes.push(child)
      } else if (isDefsComponent(child)) {
        defsNodes.push(child)
      } else if (geometryScrubbing && isPieSlice(child)) {
        return
      } else {
        svgNodes.push(child)
      }
    })

    return {
      svgChildren: svgNodes,
      centerChildren: centerNodes,
      defsChildren: defsNodes
    }
  }, [children, geometryScrubbing])

  const scrubSliceFills = useMemo(() => {
    if (!(geometryScrubbing && scrubSlicePaths)) {
      return null
    }

    return scrubSlicePaths.map((_, index) => getFill(index))
  }, [geometryScrubbing, scrubSlicePaths, getFill])

  const contextValue: PieContextValue = useMemo(
    () => ({
      data,
      arcs,
      size,
      center,
      outerRadius,
      innerRadius,
      padAngle,
      cornerRadius,
      hoverOffset,
      hoveredIndex,
      setHoveredIndex,
      animationKey,
      isLoaded: effectiveIsLoaded,
      enterTransition,
      enterStaggerScale,
      containerRef,
      totalValue,
      getColor,
      getFill,
      geometryScrubbing,
      scrubSlicePaths
    }),
    [
      data,
      arcs,
      size,
      center,
      outerRadius,
      innerRadius,
      padAngle,
      cornerRadius,
      hoverOffset,
      hoveredIndex,
      setHoveredIndex,
      animationKey,
      effectiveIsLoaded,
      enterTransition,
      enterStaggerScale,
      containerRef,
      totalValue,
      getColor,
      getFill,
      geometryScrubbing,
      scrubSlicePaths
    ]
  )

  return (
    <PieProvider value={contextValue}>
      <div
        className="grid"
        style={{
          gridTemplateColumns: "1fr",
          gridTemplateRows: "1fr",
          width: size,
          height: size
        }}
      >
        <svg
          aria-hidden="true"
          height={size}
          style={{ gridArea: "1 / 1", contain: "layout style paint" }}
          width={size}
        >
          {defsChildren.length > 0 && <defs>{defsChildren}</defs>}

          <Group left={center} top={center}>
            {scrubSlicePaths && scrubSliceFills
              ? scrubSlicePaths.map((path, index) =>
                  path ? (
                    <path
                      key={data[index]?.label ?? index}
                      d={path}
                      fill={scrubSliceFills[index]}
                      pointerEvents="none"
                    />
                  ) : null
                )
              : null}
            {svgChildren}
          </Group>
        </svg>

        {centerChildren.length > 0 && (
          <div
            className="pointer-events-none flex items-center justify-center"
            style={{ gridArea: "1 / 1" }}
          >
            {centerChildren}
          </div>
        )}
      </div>
    </PieProvider>
  )
}, pieChartCorePropsEqual)

function pieChartCorePropsEqual(
  previous: PieChartInnerProps,
  next: PieChartInnerProps
): boolean {
  return (
    previous.width === next.width &&
    previous.height === next.height &&
    previous.data === next.data &&
    previous.innerRadius === next.innerRadius &&
    previous.padAngle === next.padAngle &&
    previous.cornerRadius === next.cornerRadius &&
    previous.startAngle === next.startAngle &&
    previous.endAngle === next.endAngle &&
    previous.hoverOffset === next.hoverOffset &&
    previous.hoveredIndexProp === next.hoveredIndexProp &&
    previous.onHoverChange === next.onHoverChange &&
    previous.enterTransition === next.enterTransition &&
    previous.enterStaggerScale === next.enterStaggerScale &&
    previous.geometryScrubbing === next.geometryScrubbing &&
    previous.children === next.children
  )
}

export function PieChart({
  data,
  size: fixedSize,
  innerRadius = 0,
  padAngle = 0,
  cornerRadius = 0,
  startAngle = -Math.PI / 2,
  endAngle = (3 * Math.PI) / 2,
  className = "",
  hoveredIndex,
  onHoverChange,
  hoverOffset = DEFAULT_HOVER_OFFSET,
  enterTransition,
  enterStaggerScale = 1,
  geometryScrubbing = false,
  children
}: PieChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  if (fixedSize) {
    return (
      <div
        ref={containerRef}
        className={cn("relative flex items-center justify-center", className)}
        style={{ width: fixedSize, height: fixedSize }}
      >
        <PieChartInner
          containerRef={containerRef}
          cornerRadius={cornerRadius}
          data={data}
          endAngle={endAngle}
          enterStaggerScale={enterStaggerScale}
          enterTransition={enterTransition}
          geometryScrubbing={geometryScrubbing}
          height={fixedSize}
          hoveredIndexProp={hoveredIndex}
          hoverOffset={hoverOffset}
          innerRadius={innerRadius}
          onHoverChange={onHoverChange}
          padAngle={padAngle}
          startAngle={startAngle}
          width={fixedSize}
        >
          {children}
        </PieChartInner>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative aspect-square w-full", className)}
    >
      <ParentSize debounceTime={10}>
        {({ width, height }) => (
          <PieChartInner
            containerRef={containerRef}
            cornerRadius={cornerRadius}
            data={data}
            endAngle={endAngle}
            enterStaggerScale={enterStaggerScale}
            enterTransition={enterTransition}
            geometryScrubbing={geometryScrubbing}
            height={height}
            hoveredIndexProp={hoveredIndex}
            hoverOffset={hoverOffset}
            innerRadius={innerRadius}
            onHoverChange={onHoverChange}
            padAngle={padAngle}
            startAngle={startAngle}
            width={width}
          >
            {children}
          </PieChartInner>
        )}
      </ParentSize>
    </div>
  )
}

PieChart.displayName = "PieChart"

export default PieChart
