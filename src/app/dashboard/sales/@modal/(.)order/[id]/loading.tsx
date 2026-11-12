import { SaleDetailLoadingSkeleton } from "@/components/dashboard/dashboard-loading-skeletons"
import { SaleDetailSheetFrame } from "@/components/sales/sale-detail-sheet"

export default function Loading() {
  return (
    <SaleDetailSheetFrame>
      <SaleDetailLoadingSkeleton />
    </SaleDetailSheetFrame>
  )
}
