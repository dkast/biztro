import * as React from "react"
import type { LucideIcon } from "lucide-react"

import InfoHelper from "@/components/dashboard/info-helper"
import { cn } from "@/lib/utils"

type PageSubtitleRootProps = {
  children: React.ReactNode
  className?: string
}

type PageSubtitleIconProps = {
  icon: LucideIcon
  className?: string
}

type PageSubtitleTextProps = {
  children: React.ReactNode
  className?: string
}

function getSlot<T>(children: React.ReactNode, slot: React.ComponentType<T>) {
  return React.Children.toArray(children).find(
    child => React.isValidElement(child) && child.type === slot
  ) as React.ReactElement<T> | undefined
}

function PageSubtitleRoot({ children, className }: PageSubtitleRootProps) {
  const icon = getSlot(children, PageSubtitleIcon)
  const title = getSlot(children, PageSubtitleTitle)
  const description = getSlot(children, PageSubtitleDescription)
  const info = getSlot(children, PageSubtitleInfo)
  const actions = getSlot(children, PageSubtitleActions)

  return (
    <div className={cn("flex items-center justify-between", className)}>
      {icon}
      <div className="min-w-0 flex-1">
        {title}
        {(description || info) && (
          <div className="flex items-end gap-1">
            {description}
            {info}
          </div>
        )}
      </div>
      {actions}
    </div>
  )
}

function PageSubtitleIcon({ icon: Icon, className }: PageSubtitleIconProps) {
  return (
    <div
      className={cn(
        `mr-3 flex size-10 shrink-0 items-center justify-center rounded-lg
        bg-gray-100 text-gray-500 dark:bg-gray-900 dark:text-gray-300`,
        className
      )}
    >
      <Icon className="size-6" />
    </div>
  )
}

function PageSubtitleTitle({ children, className }: PageSubtitleTextProps) {
  return (
    <h2 className={cn("text-base leading-5 font-semibold", className)}>
      {children}
    </h2>
  )
}

function PageSubtitleDescription({
  children,
  className
}: PageSubtitleTextProps) {
  return (
    <p className={cn("text-muted-foreground text-sm leading-5", className)}>
      {children}
    </p>
  )
}

function PageSubtitleInfo({ children }: PageSubtitleTextProps) {
  return <InfoHelper>{children}</InfoHelper>
}

function PageSubtitleActions({ children, className }: PageSubtitleTextProps) {
  return (
    <div className={cn("mt-4 flex md:mt-0 md:ml-4", className)}>{children}</div>
  )
}

const PageSubtitle = Object.assign(PageSubtitleRoot, {
  Icon: PageSubtitleIcon,
  Title: PageSubtitleTitle,
  Description: PageSubtitleDescription,
  Info: PageSubtitleInfo,
  Actions: PageSubtitleActions
})

export {
  PageSubtitle,
  PageSubtitleRoot,
  PageSubtitleIcon,
  PageSubtitleTitle,
  PageSubtitleDescription,
  PageSubtitleInfo,
  PageSubtitleActions
}

export default PageSubtitle
