export default function Loading() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-gray-400" />
        Cargando…
      </div>
    </div>
  )
}
