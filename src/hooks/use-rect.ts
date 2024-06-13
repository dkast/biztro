import { useEffect, useState } from "react"

export const useRect = <T extends Element>( // skipcq: JS-0356
  dom: HTMLElement | null
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
    }, []) // eslint-disable-line react-hooks/exhaustive-deps
  }

  useEffectInEvent("resize")
  useEffectInEvent("scroll", true)

  return rect
}
