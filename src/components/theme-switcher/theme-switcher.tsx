"use client"

import type { JSX } from "react"
import { useSyncExternalStore } from "react"
import { MonitorIcon, MoonStarIcon, SunIcon } from "lucide-react"
import { motion } from "motion/react"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"

function ThemeOption({
  icon,
  value,
  isActive,
  onClick
}: {
  icon: JSX.Element
  value: string
  isActive?: boolean
  onClick: (value: string) => void
}) {
  return (
    <button
      className={cn(
        `relative flex size-6 cursor-default items-center justify-center
        rounded-full transition-[color] [&_svg]:size-3`,
        isActive
          ? "text-gray-950 dark:text-gray-50"
          : `text-gray-400 hover:text-gray-950 dark:text-gray-500
            dark:hover:text-gray-50`
      )}
      role="radio"
      aria-checked={isActive}
      aria-label={`Switch to ${value} theme`}
      onClick={() => onClick(value)}
    >
      {icon}

      {isActive && (
        <motion.div
          layoutId="theme-option"
          transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
          className="absolute inset-0 rounded-full border border-gray-200
            dark:border-gray-700"
        />
      )}
    </button>
  )
}

const THEME_OPTIONS = [
  {
    icon: <MonitorIcon />,
    value: "system"
  },
  {
    icon: <SunIcon />,
    value: "light"
  },
  {
    icon: <MoonStarIcon />,
    value: "dark"
  }
]

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  if (!isMounted) {
    return <div className="flex h-6 w-24" />
  }

  return (
    <motion.div
      key={String(isMounted)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="inline-flex items-center overflow-hidden rounded-full bg-white
        ring-1 ring-gray-200 ring-inset dark:bg-gray-950 dark:ring-gray-700"
      role="radiogroup"
    >
      {THEME_OPTIONS.map(option => (
        <ThemeOption
          key={option.value}
          icon={option.icon}
          value={option.value}
          isActive={theme === option.value}
          onClick={setTheme}
        />
      ))}
    </motion.div>
  )
}

export { ThemeSwitcher }
