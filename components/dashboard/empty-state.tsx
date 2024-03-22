"use client"
// Empty state

export function EmptyState({
  icon,
  title
}: {
  icon?: React.ReactNode
  title: string
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-y-2">
      {icon && (
        <div className="rounded-xl border border-gray-300 bg-white p-2 text-gray-400 shadow ring ring-gray-200 dark:border-gray-600 dark:bg-gray-900 dark:ring-gray-800">
          {icon}
        </div>
      )}
      <span className="font-medium text-gray-500">{title}</span>
    </div>
  )
}
