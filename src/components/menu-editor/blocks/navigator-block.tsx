import React, { useEffect, useRef, useState } from "react"
import { useEditor, useNode } from "@craftjs/core"
import type { RgbaColor } from "@uiw/react-color"
import { ChevronsRight } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import Link from "next/link"

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
  const observer = useRef<IntersectionObserver | null>(null)
  const navRef = useRef<HTMLElement | null>(null)
  const ulRef = useRef<HTMLUListElement | null>(null)

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
          return node.data.props.data.name
        } else {
          return node.data.props.text
        }
      })
    )
  }, [nodes])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry?.isIntersecting)
      },
      {
        rootMargin: "-1px 0px 0px 0px",
        threshold: [1]
      }
    )

    if (navRef.current) {
      observer.observe(navRef.current)
    }

    return () => {
      if (navRef.current) {
        observer.unobserve(navRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisibleId(entry.target.id)
        }
      })
    }

    observer.current = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: "0px 0px -30% 0px",
      threshold: 1.0
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
    const checkOverflow = () => {
      if (ulRef.current) {
        setIsOverflowing(ulRef.current.scrollWidth > ulRef.current.offsetWidth)
      }
    }

    const handleScroll = () => {
      if (ulRef.current) {
        const isAtEnd =
          ulRef.current.scrollLeft + ulRef.current.clientWidth >=
          ulRef.current.scrollWidth
        setIsOverflowing(!isAtEnd)
      }
    }

    checkOverflow()
    window.addEventListener("resize", checkOverflow)
    const ulElement = ulRef.current
    ulElement?.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("resize", checkOverflow)
      ulElement?.removeEventListener("scroll", handleScroll)
    }
  }, [ids])

  return (
    <nav
      ref={ref => {
        if (ref) {
          connect(ref)
        }
        navRef.current = ref
      }}
      className={cn("sticky top-0 z-10 p-4 transition delay-150 ease-in-out", {
        "bg-black/60 text-white! backdrop-blur-md": isSticky
      })}
      style={{
        color: `rgb(${Object.values(color ?? { r: 255, g: 255, b: 255, a: 1 })})`
      }}
    >
      {ids.length === 0 ? (
        <p>Navegador</p>
      ) : (
        <div className="relative">
          <ul
            ref={ulRef}
            className={cn(
              "flex space-x-4 overflow-x-auto",
              isOverflowing ? "mask-fade justify-normal" : "justify-center"
            )}
          >
            {ids.map((id, index) => (
              <li key={id} className="shrink-0">
                <Link
                  href={`#${id}`}
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
            {isOverflowing && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
                className="pointer-events-none absolute top-0 right-0 flex h-full items-center"
              >
                <ChevronsRight className="size-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </nav>
  )
}

NavigatorBlock.craft = {
  displayName: "Navegación",
  props: {
    color: { r: 255, g: 255, b: 255, a: 1 }
  }
}
