import { Separator } from "@/components/ui/separator"

export default function PageHeader({
  title,
  description,
  children
}: {
  title: string
  description?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <>
      <div className="px-4 py-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold leading-7 text-gray-900 dark:text-gray-50 sm:truncate sm:text-2xl sm:tracking-tight">
            {title}
          </h1>
          {description && (
            <div className="mt-1 hidden items-center text-sm text-gray-600 dark:text-gray-400 sm:flex">
              {description}
            </div>
          )}
        </div>
        {/* Attach buttons or other elements here */}
        {children && (
          <div className="mt-4 flex md:ml-4 md:mt-0">{children}</div>
        )}
      </div>
      <Separator />
    </>
  )
}
