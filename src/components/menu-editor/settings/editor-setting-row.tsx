"use client"

import type { LucideIcon } from "lucide-react"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

/**
 * Unified settings row for the menu editor sidebar: label on the left, control
 * on the right, both encapsulated by a single rounded surface.
 */
export function EditorSettingRow({
  label,
  hint,
  htmlFor,
  children,
  className
}: {
  label: React.ReactNode
  /** Optional helper rendered next to the label, outside of the `<label>`. */
  hint?: React.ReactNode
  htmlFor?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      data-slot="editor-setting-row"
      className={cn(
        `bg-muted flex min-h-9 items-center justify-between gap-2 rounded-lg
        py-1 pr-1.5 pl-3`,
        className
      )}
    >
      <div className="flex min-w-0 items-center">
        <Label htmlFor={htmlFor} className="text-muted-foreground truncate">
          {label}
        </Label>
        {hint}
      </div>
      <div className="flex shrink-0 items-center">{children}</div>
    </div>
  )
}

/**
 * Select styled to read as the row's value: no border or filled background so
 * the row itself provides the container.
 */
export function EditorSettingSelect({
  value,
  onValueChange,
  ariaLabel,
  className,
  children
}: {
  value: string | undefined
  onValueChange: (value: string) => void
  ariaLabel: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        aria-label={ariaLabel}
        className={cn(
          `text-foreground hover:bg-background/60 dark:hover:bg-background/40
          h-7! gap-1 border-0 bg-transparent px-2 text-xs font-medium
          shadow-none focus-visible:ring-0 dark:bg-transparent`,
          className
        )}
      >
        <SelectValue placeholder="Selecciona" />
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
  )
}

export type EditorSettingSegmentedOption = {
  value: string
  icon: LucideIcon
  label: string
}

/** Icon-only segmented control sized for the compact settings row. */
export function EditorSettingSegmented({
  value,
  onValueChange,
  options,
  className
}: {
  value: string
  onValueChange: (value: string) => void
  options: readonly EditorSettingSegmentedOption[]
  className?: string
}) {
  return (
    <Tabs value={value} onValueChange={onValueChange}>
      <TabsList
        className={cn(
          "bg-background/60 dark:bg-background/40 h-7! gap-0.5 p-0.5",
          className
        )}
      >
        {options.map(option => (
          <TabsTrigger
            key={option.value}
            value={option.value}
            aria-label={option.label}
            title={option.label}
            className="px-1.5"
          >
            <option.icon className="size-3.5" />
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
