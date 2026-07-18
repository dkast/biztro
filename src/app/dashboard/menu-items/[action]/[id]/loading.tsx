import {
  DashboardFormSkeleton,
  PageSubtitleSkeleton
} from "@/components/dashboard/dashboard-loading-skeletons"

export default function Loading() {
  return (
    <div className="flex grow items-start justify-center">
      <div className="w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <PageSubtitleSkeleton />
        <DashboardFormSkeleton className="mt-8" fieldCount={6} />
      </div>
    </div>
  )
}
