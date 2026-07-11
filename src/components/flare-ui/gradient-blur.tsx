import { cn } from "@/lib/utils"

export default function GradientBlur({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "gradient-blur pointer-events-none absolute z-10",
        className
      )}
    >
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  )
}
