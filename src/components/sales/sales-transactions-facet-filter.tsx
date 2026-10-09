"use client"

import { useState } from "react"
import { CheckIcon, PlusCircleIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover-base"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export type SalesTransactionsFacetOption<TValue extends string> = {
  value: TValue
  label: string
}

export function SalesTransactionsFacetFilter<TValue extends string>({
  title,
  value,
  options,
  onChange
}: {
  title: string
  value: TValue | "all"
  options: readonly SalesTransactionsFacetOption<TValue>[]
  onChange: (value: TValue | "all") => void
}) {
  const [open, setOpen] = useState(false)
  const selectedOption = options.find(option => option.value === value)

  const select = (nextValue: TValue | "all") => {
    onChange(nextValue)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className={cn("h-8", !selectedOption && "border-dashed")}
          />
        }
      >
        <PlusCircleIcon
          data-icon="inline-start"
          className="text-muted-foreground"
        />
        {title}
        {selectedOption && (
          <>
            <Separator orientation="vertical" className="mx-0.5 h-4" />
            <Badge
              variant="indigo"
              className="rounded-sm px-1 py-0.5 font-normal whitespace-nowrap"
            >
              {selectedOption.label}
            </Badge>
          </>
        )}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-52 gap-0 p-0">
        <Command>
          <CommandList>
            <CommandGroup heading={title}>
              {options.map(option => {
                const isSelected = option.value === value
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => select(isSelected ? "all" : option.value)}
                    className="py-2"
                  >
                    <span className="flex-1">{option.label}</span>
                    <CheckIcon
                      aria-hidden
                      className={cn(
                        "text-primary size-4",
                        !isSelected && "invisible"
                      )}
                    />
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selectedOption && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    value="limpiar-filtro"
                    onSelect={() => select("all")}
                    className="justify-center py-2 text-center"
                  >
                    Limpiar filtro
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
