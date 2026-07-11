import type React from "react"
import {
  Diamond,
  Layers,
  LetterText,
  LinkIcon,
  PanelTop,
  Star,
  Type
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type RenderableIcon = LucideIcon

export type MenuBlockIconKey =
  | "category"
  | "item"
  | "header"
  | "navigator"
  | "featured"
  | "heading"
  | "text"

export const menuBlockIconMeta: Record<
  MenuBlockIconKey,
  { icon: RenderableIcon; color?: string }
> = {
  category: { icon: Layers, color: "text-orange-400" },
  item: { icon: Diamond, color: "text-purple-400" },
  header: { icon: PanelTop, color: "text-indigo-400" },
  navigator: { icon: LinkIcon, color: "text-indigo-400" },
  featured: { icon: Star, color: "text-indigo-400" },
  heading: { icon: Type, color: "text-indigo-400" },
  text: { icon: LetterText, color: "text-indigo-400" }
}

export const getMenuBlockIcon = (
  key?: MenuBlockIconKey
): RenderableIcon | undefined => {
  if (!key) return undefined
  return menuBlockIconMeta[key]?.icon
}

export const getMenuBlockIconColor = (
  key?: MenuBlockIconKey
): string | undefined => {
  if (!key) return undefined
  return menuBlockIconMeta[key]?.color
}

export const renderMenuBlockIcon = (
  key?: MenuBlockIconKey,
  className?: string
): React.ReactElement | null => {
  const Icon = getMenuBlockIcon(key)
  if (!Icon) return null

  return <Icon className={cn(className, "size-3")} />
}
