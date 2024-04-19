"use client"

import * as React from "react"
import { CheckIcon, PlusCircleIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface DataTableFilterProps {
  title?: string
  options: {
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
  }[]
  value: string[]
  onChange: (value: string[]) => void
}

export function DataTableFilter({
  title,
  options,
  value,
  onChange
}: DataTableFilterProps) {
  // const value = new Set(column?.getFilterValue() as string[])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircleIcon className="mr-2 h-4 w-4 opacity-50" />
          {title}
          {value?.length > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="blue"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {value.length}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {value.length > 2 ? (
                  <Badge
                    variant="blue"
                    className="whitespace-nowrap rounded-sm px-1 font-normal"
                  >
                    {value.length} selecc.
                  </Badge>
                ) : (
                  options
                    .filter(option => value.includes(option.value))
                    .map(option => (
                      <Badge
                        variant="blue"
                        key={option.value}
                        className="whitespace-nowrap rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty className="p-2 text-center text-sm text-gray-500">
              No encontrado
            </CommandEmpty>
            <CommandGroup>
              {options.map(option => {
                const isSelected = value.includes(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (isSelected) {
                        onChange(value.filter(item => item !== option.value))
                      } else {
                        onChange([...value, option.value])
                      }
                    }}
                  >
                    <div
                      className={cn(
                        "border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <CheckIcon className={cn("h-4 w-4")} />
                    </div>
                    {option.icon && (
                      <option.icon className="text-muted-foreground mr-2 h-4 w-4" />
                    )}
                    <span>{option.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {value.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => onChange([])}
                    className="justify-center text-center"
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
