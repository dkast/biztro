"use client"

import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  MouseEvent,
  MouseEventHandler,
  ReactElement
} from "react"
import {
  Children,
  cloneElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react"
import { Dialog as DialogPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

type DialogStackContextValue = {
  activeIndex: number
  setActiveIndex: (index: number) => void
  totalDialogs: number
  setTotalDialogs: (total: number) => void
  clickable: boolean
}

const DialogStackContext = createContext<DialogStackContextValue | null>(null)
const DialogStackPanelContext = createContext(0)

function useDialogStack() {
  const context = useContext(DialogStackContext)

  if (!context) {
    throw new Error("Dialog stack components must be used within DialogStack")
  }

  return context
}

type DialogStackChildProps = {
  index?: number
}

export type DialogStackProps = React.ComponentProps<
  typeof DialogPrimitive.Root
> & {
  activeIndex?: number
  defaultActiveIndex?: number
  onActiveIndexChange?: (index: number) => void
  clickable?: boolean
}

export function DialogStack({
  children,
  activeIndex,
  defaultActiveIndex = 0,
  onActiveIndexChange,
  clickable = false,
  ...props
}: DialogStackProps) {
  const [uncontrolledActiveIndex, setUncontrolledActiveIndex] =
    useState(defaultActiveIndex)
  const [totalDialogs, setTotalDialogs] = useState(0)
  const currentActiveIndex = activeIndex ?? uncontrolledActiveIndex

  const setActiveIndex = useCallback(
    (index: number) => {
      if (activeIndex === undefined) setUncontrolledActiveIndex(index)
      onActiveIndexChange?.(index)
    },
    [activeIndex, onActiveIndexChange]
  )
  const contextValue = useMemo(
    () => ({
      activeIndex: currentActiveIndex,
      setActiveIndex,
      totalDialogs,
      setTotalDialogs,
      clickable
    }),
    [clickable, currentActiveIndex, setActiveIndex, totalDialogs]
  )

  return (
    <DialogStackContext.Provider value={contextValue}>
      <DialogPrimitive.Root {...props}>{children}</DialogPrimitive.Root>
    </DialogStackContext.Provider>
  )
}

export type DialogStackTriggerProps = React.ComponentProps<
  typeof DialogPrimitive.Trigger
>

export function DialogStackTrigger(props: DialogStackTriggerProps) {
  return <DialogPrimitive.Trigger {...props} />
}

export type DialogStackCloseProps = React.ComponentProps<
  typeof DialogPrimitive.Close
>

export function DialogStackClose(props: DialogStackCloseProps) {
  return <DialogPrimitive.Close {...props} />
}

export type DialogStackOverlayProps = React.ComponentProps<
  typeof DialogPrimitive.Overlay
>

export function DialogStackOverlay({
  className,
  ...props
}: DialogStackOverlayProps) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        `data-[state=open]:animate-in data-[state=closed]:animate-out
        data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0
        z-50 bg-black/50`,
        className
      )}
      {...props}
    />
  )
}

export type DialogStackBodyProps = Omit<
  React.ComponentProps<typeof DialogPrimitive.Content>,
  "children"
> & {
  children:
    ReactElement<DialogStackChildProps>[] | ReactElement<DialogStackChildProps>
}

export function DialogStackBody({
  children,
  className,
  ...props
}: DialogStackBodyProps) {
  const context = useDialogStack()
  const totalDialogs = Children.count(children)
  const { setTotalDialogs } = context

  useEffect(() => {
    setTotalDialogs(totalDialogs)
  }, [setTotalDialogs, totalDialogs])

  return (
    <DialogPrimitive.Portal>
      <DialogStackOverlay />
      <DialogPrimitive.Content
        className={cn(
          `fixed top-1/2 left-1/2 z-50 flex w-full max-w-[calc(100%-2rem)]
          -translate-x-1/2 -translate-y-1/2 items-center justify-center
          outline-none sm:max-w-xl`,
          className
        )}
        {...props}
      >
        <div className="relative flex w-full items-center justify-center">
          {Children.map(children, (child, index) =>
            cloneElement(child, { ...child.props, index })
          )}
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export type DialogStackContentProps = HTMLAttributes<HTMLDivElement> & {
  index?: number
  offset?: number
}

export function DialogStackContent({
  children,
  className,
  index = 0,
  offset = 10,
  style,
  ...props
}: DialogStackContentProps) {
  const context = useDialogStack()
  const panelRef = useRef<HTMLDivElement>(null)
  const wasActiveRef = useRef(index === context.activeIndex)
  const distanceFromActive = index - context.activeIndex
  const isActive = distanceFromActive === 0
  const isClickablePrevious = context.clickable && context.activeIndex > index
  const translateY =
    distanceFromActive < 0
      ? `-${Math.abs(distanceFromActive) * offset}px`
      : `${Math.abs(distanceFromActive) * offset}px`

  const handleClick = () => {
    if (context.clickable && context.activeIndex > index) {
      context.setActiveIndex(index)
    }
  }

  useEffect(() => {
    if (isActive && !wasActiveRef.current) {
      const animationFrame = requestAnimationFrame(() => {
        const focusTarget =
          panelRef.current?.querySelector<HTMLElement>(
            "[data-dialog-stack-title]"
          ) ?? panelRef.current

        focusTarget?.focus()
      })

      wasActiveRef.current = isActive
      return () => cancelAnimationFrame(animationFrame)
    }

    wasActiveRef.current = isActive
  }, [isActive])

  return (
    <div
      aria-hidden={!isActive}
      className={cn(
        `bg-background w-full rounded-lg border p-6 shadow-lg transition-all
        duration-300 motion-reduce:transition-none`,
        !isActive && !isClickablePrevious && "pointer-events-none select-none",
        className
      )}
      onClick={handleClick}
      style={{
        top: 0,
        transform: `translateY(${translateY})`,
        width: `calc(100% - ${Math.abs(distanceFromActive) * 10}px)`,
        zIndex: 50 - Math.abs(context.activeIndex - index),
        position: distanceFromActive ? "absolute" : "relative",
        opacity: distanceFromActive > 0 ? 0 : 1,
        cursor: isClickablePrevious ? "pointer" : "default",
        ...style
      }}
      {...props}
    >
      <DialogStackPanelContext.Provider value={index}>
        <div
          ref={panelRef}
          className={cn(
            `transition-opacity duration-200 outline-none
            motion-reduce:transition-none`,
            !isActive && "opacity-0"
          )}
          inert={!isActive}
          tabIndex={-1}
        >
          {children}
        </div>
      </DialogStackPanelContext.Provider>
    </div>
  )
}

export type DialogStackTitleProps = React.ComponentProps<
  typeof DialogPrimitive.Title
>

export function DialogStackTitle({
  className,
  children,
  ...props
}: DialogStackTitleProps) {
  const context = useDialogStack()
  const panelIndex = useContext(DialogStackPanelContext)
  const titleClassName = cn(
    "text-lg leading-none font-semibold outline-none",
    className
  )

  if (context.activeIndex !== panelIndex) {
    return (
      <h2
        className={titleClassName}
        data-dialog-stack-title=""
        tabIndex={-1}
        {...props}
      >
        {children}
      </h2>
    )
  }

  return (
    <DialogPrimitive.Title
      className={titleClassName}
      data-dialog-stack-title=""
      tabIndex={-1}
      {...props}
    >
      {children}
    </DialogPrimitive.Title>
  )
}

export type DialogStackDescriptionProps = React.ComponentProps<
  typeof DialogPrimitive.Description
>

export function DialogStackDescription({
  className,
  children,
  ...props
}: DialogStackDescriptionProps) {
  const context = useDialogStack()
  const panelIndex = useContext(DialogStackPanelContext)
  const descriptionClassName = cn("text-muted-foreground text-sm", className)

  if (context.activeIndex !== panelIndex) {
    return (
      <p className={descriptionClassName} {...props}>
        {children}
      </p>
    )
  }

  return (
    <DialogPrimitive.Description className={descriptionClassName} {...props}>
      {children}
    </DialogPrimitive.Description>
  )
}

export function DialogStackHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

export function DialogStackFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

type StackNavigationProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean
}

function NavigationButton({
  direction,
  children,
  className,
  asChild,
  onClick,
  ...props
}: StackNavigationProps & { direction: -1 | 1 }) {
  const context = useDialogStack()
  const nextIndex = context.activeIndex + direction
  const child = asChild
    ? (children as ReactElement<{
        className?: string
        disabled?: boolean
        onClick?: MouseEventHandler<HTMLButtonElement>
      }>)
    : null
  const isDisabled =
    nextIndex < 0 ||
    nextIndex >= context.totalDialogs ||
    props.disabled ||
    child?.props.disabled

  const handleClick: MouseEventHandler<HTMLButtonElement> = event => {
    if (!isDisabled) context.setActiveIndex(nextIndex)
    onClick?.(event)
  }

  if (child) {
    return cloneElement(child, {
      ...props,
      disabled: isDisabled,
      onClick: (event: MouseEvent<HTMLButtonElement>) => {
        handleClick(event)
        child.props.onClick?.(event)
      },
      className: cn(className, child.props.className)
    })
  }

  return (
    <button
      type="button"
      className={className}
      disabled={isDisabled}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
}

export function DialogStackNext(props: StackNavigationProps) {
  return <NavigationButton direction={1} {...props} />
}

export function DialogStackPrevious(props: StackNavigationProps) {
  return <NavigationButton direction={-1} {...props} />
}
