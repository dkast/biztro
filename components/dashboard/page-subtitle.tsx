export default function PageSubtitle({
  title,
  description,
  children
}: {
  title: string
  description?: string
  children?: React.ReactNode
}) {
  return (
    <div className="md:flex md:items-center md:justify-between">
      <div className="min-w-0 flex-1">
        <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-100">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>
      {/* Attach buttons or other elements here */}
      {children && <div className="mt-4 flex md:ml-4 md:mt-0">{children}</div>}
    </div>
  )
}
