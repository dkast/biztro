import {
  DashboardTableSkeleton,
  PageSubtitleSkeleton
} from "@/components/dashboard/dashboard-loading-skeletons"

export default function Loading() {
  return (
    <div className="mx-auto grow px-4 py-6 sm:px-6">
      <PageSubtitleSkeleton actionCount={1} />
      <DashboardTableSkeleton className="mt-6" columnCount={4} />
    </div>
  )
}
