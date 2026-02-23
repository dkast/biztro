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
      <small
        className="mb-4 block text-base font-semibold tracking-widest
          text-taupe-500 uppercase dark:text-taupe-400"
      >
        {eyebrow}
      </small>
      <h2
        className="font-display text-3xl tracking-tight text-balance
          text-taupe-950 sm:text-4xl md:text-5xl dark:text-taupe-50"
      >
        {title}
      </h2>
    </div>
  )
}
