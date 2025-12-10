import { cn } from "@/lib/utils"

export default function TitleSection({
  eyebrow,
  title,
  className
}: {
  eyebrow: string
  title: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8",
        className
      )}
    >
      <small className="mb-4 block text-base font-semibold tracking-widest text-orange-600 uppercase">
        {eyebrow}
      </small>
      <h2 className="font-display text-3xl tracking-tight text-balance text-gray-950 sm:text-4xl md:text-5xl dark:text-white">
        {title}
      </h2>
    </div>
  )
}
