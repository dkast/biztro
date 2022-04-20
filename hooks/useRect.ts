import { useEffect, useState } from "react"

export const useRect = <T extends Element>(
  dom: HTMLElement
): DOMRect | undefined => {
  // const ref = useRef<T>(null)
  const [rect, setRect] = useState<DOMRect>()

  const set = () => setRect(dom?.getBoundingClientRect())

  const useEffectInEvent = (
    event: "resize" | "scroll",
    useCapture?: boolean
  ) => {
    useEffect(() => {
      set()
      window.addEventListener(event, set, useCapture)
      return () => window.removeEventListener(event, set, useCapture)
    }, [])
  }

  useEffectInEvent("resize")
  useEffectInEvent("scroll", true)

  return rect
}
