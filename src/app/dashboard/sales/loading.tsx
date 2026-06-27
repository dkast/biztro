import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div
      className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:gap-8
        sm:px-6 sm:py-6"
    >
      <section
        className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-end
          sm:justify-between sm:gap-4 sm:pb-5"
      >
        <div className="flex items-start gap-3">
          <Skeleton className="size-10 shrink-0 rounded-lg" />
          <div className="space-y-2 pt-0.5">
            <Skeleton className="h-5 w-28 sm:h-6 sm:w-36" />
            <Skeleton className="h-4 w-56 max-w-[72vw] sm:w-72" />
          </div>
        </div>

        <div className="w-full sm:mt-0 sm:w-auto sm:flex-none">
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
            <Skeleton className="h-3.5 w-16" />
            <div
              className="bg-muted grid grid-cols-2 gap-1 rounded-lg p-[3px]
                sm:inline-flex sm:w-auto sm:flex-nowrap"
            >
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-8 rounded-md" />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-border overflow-hidden rounded-lg border">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-nowrap items-center justify-between gap-4
                rounded-none border-0 p-4 sm:p-5"
            >
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-7 w-28" />
              </div>
              <Skeleton className="size-8 shrink-0 rounded-xl" />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 py-6 sm:space-y-5 sm:py-8">
        <div
          className="flex flex-col items-start gap-2 sm:flex-row sm:items-center
            sm:justify-between sm:gap-4"
        >
          <div className="space-y-2">
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-6 w-24 rounded-md" />
        </div>
        <Skeleton className="h-px w-full" />
        <div className="space-y-3 pt-1">
          <Skeleton className="h-[13rem] rounded-2xl sm:h-[16rem] lg:h-[18rem]" />
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-3 rounded-full" />
            ))}
          </div>
        </div>
      </section>

      <Skeleton className="h-px w-full" />

      <section
        className="grid gap-y-6 xl:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)]
          xl:items-start xl:gap-x-8 xl:gap-y-0"
      >
        <div className="space-y-4">
          <div
            className="flex flex-col items-start gap-2 sm:flex-row
              sm:items-center sm:justify-between sm:gap-4"
          >
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-6 w-10 rounded-md" />
          </div>
          <Skeleton className="h-px w-full" />
          <div className="border-border overflow-hidden rounded-lg border">
            <div className="grid min-w-[34rem] gap-0">
              <div className="border-border grid grid-cols-4 border-b px-4 py-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-4 w-16" />
                ))}
              </div>
              {Array.from({ length: 5 }).map((_, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-4 px-4 py-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-4 w-10 justify-self-end" />
                  <Skeleton className="h-4 w-16 justify-self-end" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <Skeleton className="hidden xl:block xl:h-full xl:w-px" />

        <div className="space-y-4">
          <div
            className="flex flex-col items-start gap-2 sm:flex-row
              sm:items-center sm:justify-between sm:gap-4"
          >
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-6 w-10 rounded-md" />
          </div>
          <Skeleton className="h-px w-full" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-4 rounded-none py-4"
              >
                <Skeleton className="size-8 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-44 max-w-[60vw]" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <div className="ml-auto flex flex-col items-end gap-2 pl-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-14" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
