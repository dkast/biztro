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
        <div className="rounded-full bg-gradient-to-b from-gray-100 to-transparent p-2.5 dark:from-transparent dark:to-gray-900">
          <div className="rounded-full border border-gray-200 bg-white p-3 text-gray-400 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-500">
            {icon}
          </div>
        </div>
      )}
      <span className="font-medium text-gray-500">{title}</span>
    </div>
  )
}
