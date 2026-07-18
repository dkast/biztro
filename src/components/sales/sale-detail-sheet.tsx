"use client"

import { useRouter } from "next/navigation"

import { SaleDetailView } from "@/components/sales/sale-detail"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet"
import type { SaleDetail } from "@/lib/types/sales"

export function SaleDetailSheet({ sale }: { sale: SaleDetail }) {
  const router = useRouter()

  return (
    <Sheet
      defaultOpen
      onOpenChange={open => {
        if (!open) router.back()
      }}
    >
      <SheetContent
        className="flex h-[calc(100%-1rem)] w-[calc(100%-1rem)] flex-col gap-0
          overflow-hidden p-0 sm:max-w-2xl"
      >
        <SheetHeader className="border-b px-5 py-4 sm:px-6 sm:py-5">
          <SheetTitle>Detalle de venta</SheetTitle>
          <SheetDescription>
            Auditoría de la transacción y sus productos
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
          <SaleDetailView sale={sale} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
