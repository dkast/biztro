import type { ReactNode } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it, vi } from "vitest"

import Loading from "@/app/dashboard/sales/@modal/(.)order/[id]/loading"

const state = vi.hoisted(() => ({
  isMobile: false,
  back: vi.fn(),
  onOpenChange: undefined as ((open: boolean) => void) | undefined
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: state.back })
}))

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => state.isMobile
}))

vi.mock("@/lib/utils", async () => ({
  cn: (await import("cn")).cn
}))

vi.mock("@/components/sales/sale-detail", () => ({
  SaleDetailView: () => null
}))

function content({ children }: { children?: ReactNode }) {
  return <div>{children}</div>
}

vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({
    children,
    open,
    onOpenChange
  }: {
    children: ReactNode
    open: boolean
    onOpenChange: (open: boolean) => void
  }) => {
    state.onOpenChange = onOpenChange
    return open ? <section data-overlay="sheet">{children}</section> : null
  },
  SheetContent: content,
  SheetHeader: content,
  SheetTitle: content,
  SheetDescription: content
}))

vi.mock("@/components/ui/drawer", () => ({
  Drawer: ({
    children,
    open,
    onOpenChange
  }: {
    children: ReactNode
    open: boolean
    onOpenChange: (open: boolean) => void
  }) => {
    state.onOpenChange = onOpenChange
    return open ? <section data-overlay="drawer">{children}</section> : null
  },
  DrawerContent: content,
  DrawerHeader: content,
  DrawerTitle: content,
  DrawerDescription: content
}))

describe.each([
  { isMobile: false, overlay: "sheet" },
  { isMobile: true, overlay: "drawer" }
])("sale detail loading in $overlay", ({ isMobile, overlay }) => {
  beforeEach(() => {
    state.isMobile = isMobile
    state.back.mockClear()
    state.onOpenChange = undefined
  })

  it("renders the skeleton inside an open, titled overlay", () => {
    const html = renderToStaticMarkup(<Loading />)

    expect(html).toMatch(new RegExp(`^<section data-overlay="${overlay}">`))
    expect(html).toContain("Detalle de venta")
    expect(html).toContain("animate-pulse")
    expect(html).toContain("overflow-y-auto")
  })

  it("navigates back only when the loading overlay closes", () => {
    renderToStaticMarkup(<Loading />)

    expect(state.onOpenChange).toBeDefined()
    state.onOpenChange?.(true)
    expect(state.back).not.toHaveBeenCalled()
    state.onOpenChange?.(false)
    expect(state.back).toHaveBeenCalledOnce()
  })
})
