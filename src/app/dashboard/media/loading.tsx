export default function MediaLoading() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b">
        <div className="flex h-16 items-center gap-4 px-6">
          <div className="bg-muted size-5 animate-pulse rounded" />
          <div className="flex-1 space-y-2">
            <div className="bg-muted h-5 w-48 animate-pulse rounded" />
            <div className="bg-muted h-4 w-32 animate-pulse rounded" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4
            lg:grid-cols-5"
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-muted aspect-square animate-pulse rounded-lg"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
