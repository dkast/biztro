"use client"

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode
} from "react"
import { useControllableState } from "@radix-ui/react-use-controllable-state"
import { ChevronsUpDownIcon, PlusIcon } from "lucide-react"

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
import { cn } from "@/lib/utils"

type ComboboxData = {
  label: string
  value: string
}

type ComboboxContextType = {
  data: ComboboxData[]
  type: string
  value: string
  onValueChange: (value: string) => void
  open: boolean
  onOpenChange: (open: boolean) => void
  width: number
  setWidth: (width: number) => void
  inputValue: string
  setInputValue: (value: string) => void
}

const ComboboxContext = createContext<ComboboxContextType>({
  data: [],
  type: "item",
  value: "",
  onValueChange: () => {},
  open: false,
  onOpenChange: () => {},
  width: 200,
  setWidth: () => {},
  inputValue: "",
  setInputValue: () => {}
})

export type ComboboxProps = ComponentProps<typeof Popover> & {
  data: ComboboxData[]
  type: string
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export const Combobox = ({
  data,
  type,
  defaultValue,
  value: controlledValue,
  onValueChange: controlledOnValueChange,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  ...props
}: ComboboxProps) => {
  const [value, onValueChange] = useControllableState({
    defaultProp: defaultValue ?? "",
    prop: controlledValue,
    onChange: controlledOnValueChange
  })
  const [open, onOpenChange] = useControllableState({
    defaultProp: defaultOpen,
    prop: controlledOpen,
    onChange: controlledOnOpenChange
  })
  const [width, setWidth] = useState(200)
  const [inputValue, setInputValue] = useState("")

  return (
    <ComboboxContext.Provider
      value={{
        type,
        value,
        onValueChange,
        open,
        onOpenChange,
        data,
        width,
        setWidth,
        inputValue,
        setInputValue
      }}
    >
      <Popover {...props} onOpenChange={onOpenChange} open={open} />
    </ComboboxContext.Provider>
  )
}

export type ComboboxTriggerProps = ComponentProps<typeof Button>

export const ComboboxTrigger = ({
  children,
  ...props
}: ComboboxTriggerProps) => {
  const { value, data, type, setWidth } = useContext(ComboboxContext)
  const ref = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    // Create a ResizeObserver to detect width changes
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const newWidth = (entry.target as HTMLElement).offsetWidth
        if (newWidth) {
          setWidth?.(newWidth)
        }
      }
    })

    if (ref.current) {
      resizeObserver.observe(ref.current)
    }

    // Clean up the observer when component unmounts
    return () => {
      resizeObserver.disconnect()
    }
  }, [setWidth])

  return (
    <PopoverTrigger asChild>
      <Button variant="outline" {...props} ref={ref}>
        {children ?? (
          <span className="flex w-full items-center justify-between gap-2">
            {value
              ? data.find(item => item.value === value)?.label
              : `Select ${type}...`}
            <ChevronsUpDownIcon
              className="text-muted-foreground shrink-0"
              size={16}
            />
          </span>
        )}
      </Button>
    </PopoverTrigger>
  )
}

export type ComboboxContentProps = ComponentProps<typeof Command> & {
  popoverOptions?: ComponentProps<typeof PopoverContent>
}

export const ComboboxContent = ({
  className,
  popoverOptions,
  ...props
}: ComboboxContentProps) => {
  const { width } = useContext(ComboboxContext)

  return (
    <PopoverContent
      className={cn("p-0", className)}
      style={{ width }}
      {...popoverOptions}
    >
      <Command {...props} />
    </PopoverContent>
  )
}

export type ComboboxInputProps = ComponentProps<typeof CommandInput> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

export const ComboboxInput = ({
  value: controlledValue,
  defaultValue,
  onValueChange: controlledOnValueChange,
  ...props
}: ComboboxInputProps) => {
  const { type, inputValue, setInputValue } = useContext(ComboboxContext)

  const [value, onValueChange] = useControllableState({
    defaultProp: defaultValue ?? inputValue,
    prop: controlledValue,
    onChange: newValue => {
      // Sync with context state
      setInputValue(newValue)
      // Call external onChange if provided
      controlledOnValueChange?.(newValue)
    }
  })

  return (
    <CommandInput
      onValueChange={onValueChange}
      placeholder={`Search ${type}...`}
      value={value}
      {...props}
    />
  )
}

export type ComboboxListProps = ComponentProps<typeof CommandList>

export const ComboboxList = (props: ComboboxListProps) => (
  <CommandList {...props} />
)

export type ComboboxEmptyProps = ComponentProps<typeof CommandEmpty>

export const ComboboxEmpty = ({ children, ...props }: ComboboxEmptyProps) => {
  const { type } = useContext(ComboboxContext)

  return (
    <CommandEmpty {...props}>{children ?? `No ${type} found.`}</CommandEmpty>
  )
}

export type ComboboxGroupProps = ComponentProps<typeof CommandGroup>

export const ComboboxGroup = (props: ComboboxGroupProps) => (
  <CommandGroup {...props} />
)

export type ComboboxItemProps = ComponentProps<typeof CommandItem>

export const ComboboxItem = (props: ComboboxItemProps) => {
  const { onValueChange, onOpenChange, data } = useContext(ComboboxContext)

  // Incoming props.value may be the underlying id (data.value). For better
  // filtering we want CommandItem to expose the human-readable label as its
  // `.value` (the string that Command will match against). So we translate
  // the incoming prop to the corresponding label when rendering. When an
  // item is selected, map the label back to the underlying id and call
  // onValueChange with the id.
  const incomingValue = props.value as string | undefined
  const displayValue = incomingValue
    ? (data.find(d => d.value === incomingValue)?.label ?? incomingValue)
    : props.children && typeof props.children === "string"
      ? (props.children as unknown as string)
      : (incomingValue ?? "")

  // Build new props to pass to CommandItem where `value` is the display label
  // so Command's filtering/search will work over the human text.
  const commandItemProps = {
    ...props,
    value: displayValue
  } as ComboboxItemProps

  return (
    <CommandItem
      {...commandItemProps}
      onSelect={currentValue => {
        // currentValue will be the display label (because we set value to label).
        const matched = data.find(
          d => d.label === currentValue || d.value === currentValue
        )
        const newValue = matched ? matched.value : currentValue
        onValueChange(newValue)
        onOpenChange(false)
      }}
    />
  )
}

export type ComboboxSeparatorProps = ComponentProps<typeof CommandSeparator>

export const ComboboxSeparator = (props: ComboboxSeparatorProps) => (
  <CommandSeparator {...props} />
)

export type ComboboxCreateNewProps = {
  onCreateNew: (value: string) => void
  children?: (inputValue: string) => ReactNode
  className?: string
}

export const ComboboxCreateNew = ({
  onCreateNew,
  children,
  className
}: ComboboxCreateNewProps) => {
  const { inputValue, type, onValueChange, onOpenChange } =
    useContext(ComboboxContext)

  if (!inputValue.trim()) {
    return null
  }

  const handleCreateNew = () => {
    onCreateNew(inputValue.trim())
    onValueChange(inputValue.trim())
    onOpenChange(false)
  }

  return (
    <button
      className={cn(
        "aria-selected:bg-accent aria-selected:text-accent-foreground relative flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      onClick={handleCreateNew}
      type="button"
    >
      {children ? (
        children(inputValue)
      ) : (
        <>
          <PlusIcon className="text-muted-foreground h-4 w-4" />
          <span>{`Create new ${type}: "${inputValue}"`}</span>
        </>
      )}
    </button>
  )
}
