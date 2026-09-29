import React, { useEffect, useRef, useState } from "react"
import { useEditor, useNode } from "@craftjs/core"
import type { RgbaColor } from "@uiw/react-color"
import { ChevronsRight, Menu } from "lucide-react"
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform
} from "motion/react"
import Link from "next/link"

import { useTranslation } from "@/components/menu-editor/translation-provider"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer"
import { useIsMobile } from "@/hooks/use-mobile"
import { normalizeMenuLabelCasing } from "@/lib/menu-text"
import { cn } from "@/lib/utils"

export type NavigatorBlockProps = {
  color?: RgbaColor
}

export default function NavigatorBlock({ color }: NavigatorBlockProps) {
  const {
    connectors: { connect }
  } = useNode()

  const { nodes } = useEditor(state => ({
    nodes: state.nodes
  }))

  const [ids, setIds] = useState<string[]>([])
  const [displayNames, setDisplayNames] = useState<string[]>([])
  const [visibleId, setVisibleId] = useState<string | null>(null)
  const [isSticky, setIsSticky] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const observer = useRef<IntersectionObserver | null>(null)
  const navigatingToRef = useRef<string | null>(null)
  const navRef = useRef<HTMLElement | null>(null)
  const ulRef = useRef<HTMLUListElement | null>(null)
  const scrollContainerRef = useRef<HTMLElement | null>(null)
  const [hasContainerScrollRoot, setHasContainerScrollRoot] = useState(false)
  const isMobile = useIsMobile()
  const translation = useTranslation()

  const { scrollY: viewportScrollY } = useScroll()
  const { scrollY: containerScrollY } = useScroll(
    hasContainerScrollRoot ? { container: scrollContainerRef } : {}
  )
  const activeScrollY = useTransform(() =>
    hasContainerScrollRoot ? containerScrollY.get() : viewportScrollY.get()
  )

  useMotionValueEvent(activeScrollY, "change", latest => {
    setIsSticky(latest > 8)
  })

  const handleSectionNavigation = (id: string, shouldCloseDrawer = false) => {
    if (shouldCloseDrawer) {
      setIsDrawerOpen(false)
    }

    requestAnimationFrame(() => {
      const target = document.getElementById(id)

      if (target) {
        // Lock the active tab so the list doesn't scrub through every section passed.
        navigatingToRef.current = id
        setVisibleId(id)

        // Calculate target scroll position accounting for the sticky nav height
        const navHeight = navRef.current?.offsetHeight ?? 0
        const headerOffset = getHeaderOffset()
        const extraSpacing = 8 // small breathing room so heading isn't flush with nav
        const targetRect = target.getBoundingClientRect()
        const scrollRoot = scrollContainerRef.current
        releaseNavigationLock(scrollRoot ?? window, navigatingToRef)

        if (scrollRoot) {
          // Container scroll: compute offset relative to the scroll container
          const containerRect = scrollRoot.getBoundingClientRect()
          const absoluteTop =
            scrollRoot.scrollTop + targetRect.top - containerRect.top
          const scrollTop = Math.max(
            0,
            absoluteTop - navHeight - headerOffset - extraSpacing
          )
          scrollRoot.scrollTo({ top: scrollTop, behavior: "smooth" })
        } else {
          const absoluteTop = window.scrollY + targetRect.top
          const scrollTop = Math.max(
            0,
            absoluteTop - navHeight - headerOffset - extraSpacing
          )
          window.scrollTo({ top: scrollTop, behavior: "smooth" })
        }
      }

      window.history.replaceState(null, "", `#${id}`)
    })
  }

  useEffect(() => {
    const rootNode = nodes.ROOT
    const rootNodeArray = rootNode?.data?.nodes || []

    const filteredAndSortedNodes = rootNodeArray
      .map(id => nodes[id])
      .filter(
        (node): node is NonNullable<typeof node> =>
          node?.data.name === "CategoryBlock" ||
          node?.data.name === "HeadingElement"
      )

    setIds(filteredAndSortedNodes.map(node => node.id))
    setDisplayNames(
      filteredAndSortedNodes.map(node => {
        if (node.data.name === "CategoryBlock") {
          return normalizeMenuLabelCasing(
            translation?.getCategoryTranslation(node.data.props.data.id)
              ?.name ?? node.data.props.data.name
          )
        } else {
          return node.data.props.text
        }
      })
    )
  }, [nodes, translation])

  useEffect(() => {
    const navNode = navRef.current
    if (!navNode) return

    const scrollRoot = getScrollRoot(navNode)
    scrollContainerRef.current = isElementScrollRoot(scrollRoot)
      ? scrollRoot
      : null
    setHasContainerScrollRoot(scrollContainerRef.current !== null)
    setIsSticky(getScrollTop(scrollRoot, navNode.ownerDocument) > 8)
  }, [])

  useEffect(() => {
    const passedIds = new Set<string>()

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          passedIds.add(entry.target.id)
        } else {
          passedIds.delete(entry.target.id)
        }
      })

      if (navigatingToRef.current) return
      const activeId = ids.findLast(id => passedIds.has(id)) ?? ids[0]
      if (activeId) setVisibleId(activeId)
    }

    // Root spans everything above 40% of the viewport, so the active section is
    // the last heading that crossed that line, in either scroll direction.
    observer.current = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: "100000px 0px -60% 0px",
      threshold: 0
    })

    ids.forEach(id => {
      const element = document.getElementById(id)
      if (element) {
        observer.current?.observe(element)
      }
    })

    return () => {
      observer.current?.disconnect()
    }
  }, [ids])

  useEffect(() => {
    const ulElement = ulRef.current

    const updateScrollState = () => {
      if (!ulElement) return
      const { scrollLeft, scrollWidth, clientWidth } = ulElement
      // 1px tolerance: iOS reports fractional scrollLeft at the end.
      const hasOverflow = scrollWidth - clientWidth > 1
      setIsOverflowing(hasOverflow)
      setCanScrollRight(
        hasOverflow && scrollLeft + clientWidth < scrollWidth - 1
      )
    }

    updateScrollState()
    window.addEventListener("resize", updateScrollState)
    ulElement?.addEventListener("scroll", updateScrollState, { passive: true })

    return () => {
      window.removeEventListener("resize", updateScrollState)
      ulElement?.removeEventListener("scroll", updateScrollState)
    }
  }, [ids, displayNames])

  // Auto-scroll navigation to keep active section in view.
  // Scroll only horizontally within the <ul> — never scroll the page vertically.
  // Using scrollIntoView() would pull the entire page up to reveal the nav when
  // it has scrolled off-screen (position: relative in the editor), causing the
  // "jump to top" bug.
  useEffect(() => {
    if (visibleId && ulRef.current) {
      const activeIndex = ids.indexOf(visibleId)
      if (activeIndex !== -1) {
        const activeLink = ulRef.current.children[activeIndex] as HTMLElement
        if (activeLink) {
          const ul = ulRef.current
          const targetScrollLeft =
            activeLink.offsetLeft -
            (ul.offsetWidth - activeLink.offsetWidth) / 2
          ul.scrollTo({
            left: Math.max(0, targetScrollLeft),
            behavior: "smooth"
          })
        }
      }
    }
  }, [visibleId, ids])

  return (
    <>
      <nav
        ref={ref => {
          if (ref) {
            connect(ref)
          }
          navRef.current = ref
        }}
        className={cn(
          "sticky z-20 w-screen p-3 transition-colors duration-200 sm:w-full",
          {
            "backdrop-blur-md": isSticky
          }
        )}
        style={{
          top: "var(--menu-header-offset, 0px)",
          color: isSticky
            ? "rgba(255, 255, 255, 0.96)"
            : rgbaToCss(color, { r: 255, g: 255, b: 255, a: 1 }),
          backgroundColor: isSticky ? "rgba(0, 0, 0, 0.62)" : "transparent"
        }}
      >
        {ids.length === 0 ? (
          <p>Navegador</p>
        ) : (
          <div className="relative flex items-center gap-2">
            {/* Menu button - visible only on mobile */}
            <Button
              variant="ghost"
              size="icon-sm"
              className="shrink-0 md:hidden"
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Abrir menú de navegación"
            >
              <Menu className="size-4" />
            </Button>

            {/* Horizontal navigation */}
            <div className="relative flex-1 overflow-hidden">
              <ul
                ref={ulRef}
                className={cn(
                  "no-scrollbar scroll-fade-x flex space-x-4 overflow-x-auto",
                  isOverflowing ? "justify-normal" : "justify-center"
                )}
              >
                {ids.map((id, index) => (
                  <li key={id} className="shrink-0">
                    <Link
                      href={`#${id}`}
                      onClick={event => {
                        event.preventDefault()
                        handleSectionNavigation(id)
                      }}
                      prefetch={false}
                      className={cn(
                        visibleId === id
                          ? "underline decoration-2 underline-offset-4"
                          : ""
                      )}
                    >
                      {displayNames[index]}
                    </Link>
                  </li>
                ))}
              </ul>
              <AnimatePresence>
                {canScrollRight && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.3 }}
                    className="pointer-events-none absolute top-0 right-0 flex
                      h-full items-center"
                  >
                    <ChevronsRight className="size-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile drawer for navigation */}
      {isMobile && ids.length > 0 && (
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerContent className="max-h-[85%]">
            <DrawerHeader>
              <DrawerTitle>Navegación</DrawerTitle>
            </DrawerHeader>
            <nav className="no-scrollbar overflow-y-auto px-4 pb-8">
              <ul className="flex flex-col space-y-2">
                {ids.map((id, index) => (
                  <li key={id}>
                    <Link
                      href={`#${id}`}
                      onClick={event => {
                        event.preventDefault()
                        handleSectionNavigation(id, true)
                      }}
                      prefetch={false}
                      className={cn(
                        `hover:bg-accent block rounded-md px-4 py-3 text-lg
                        transition-colors`,
                        visibleId === id ? "bg-accent font-semibold" : ""
                      )}
                    >
                      {displayNames[index]}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </DrawerContent>
        </Drawer>
      )}
    </>
  )
}

NavigatorBlock.craft = {
  displayName: "Navegación",
  props: {
    color: { r: 255, g: 255, b: 255, a: 1 }
  },
  custom: {
    iconKey: "navigator"
  }
}

function getHeaderOffset() {
  const rawValue = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue("--menu-header-offset")
    .trim()

  const parsedValue = Number.parseFloat(rawValue)
  if (Number.isNaN(parsedValue)) return 0

  return parsedValue
}

type ScrollRoot = Window | HTMLElement

function releaseNavigationLock(
  scrollRoot: ScrollRoot,
  lockRef: React.RefObject<string | null>
) {
  const release = () => {
    lockRef.current = null
    scrollRoot.removeEventListener("scrollend", release)
    window.clearTimeout(fallbackTimer)
  }
  // Fallback for engines without `scrollend` or when no scroll was needed.
  const fallbackTimer = window.setTimeout(release, 1000)
  scrollRoot.addEventListener("scrollend", release, { once: true })
}

function getScrollRoot(node: HTMLElement): ScrollRoot {
  let current: HTMLElement | null = node.parentElement
  const ownerWindow = node.ownerDocument.defaultView ?? window

  while (current) {
    if (current.dataset.menuScrollRoot === "true") {
      return current
    }

    const styles = ownerWindow.getComputedStyle(current)
    const overflowY = styles.overflowY

    if (
      /(auto|scroll|overlay)/.test(overflowY) &&
      current.scrollHeight > current.clientHeight
    ) {
      return current
    }

    current = current.parentElement
  }

  return ownerWindow
}

function getScrollTop(root: ScrollRoot, ownerDocument: Document) {
  if (isElementScrollRoot(root)) {
    return root.scrollTop
  }

  return root.scrollY || ownerDocument.documentElement.scrollTop || 0
}

function isElementScrollRoot(root: ScrollRoot): root is HTMLElement {
  return "scrollTop" in root
}

function rgbaToCss(color: RgbaColor | undefined, fallback: RgbaColor) {
  const value = color ?? fallback
  return `rgba(${value.r}, ${value.g}, ${value.b}, ${value.a ?? 1})`
}
