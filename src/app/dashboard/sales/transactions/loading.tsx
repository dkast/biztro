import {
  DashboardTableSkeleton,
  PageSubtitleSkeleton
} from "@/components/dashboard/dashboard-loading-skeletons"

export default function Loading() {
  return (
    <div
      className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6
        sm:py-6"
    >
      <PageSubtitleSkeleton actionCount={1} />
      <DashboardTableSkeleton columnCount={7} rowCount={8} />
    </div>
  )
}
