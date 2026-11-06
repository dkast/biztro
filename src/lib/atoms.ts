import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"

import { FrameSize, type ColorTheme } from "@/lib/types/theme"

export const elementPropsAtom = atom<{ [x: string]: unknown }>({})

export const frameSizeAtom = atomWithStorage("frameSize", FrameSize.MOBILE)

export const fontThemeAtom = atom("DEFAULT")

export const colorThemeAtom = atom("DEFAULT")

export const tourModeAtom = atomWithStorage("tourMode", true)

export const onboardingCardsCollapsedAtom = atomWithStorage(
  "onboardingCardsCollapsed",
  false
)

export const isSoundMutedAtom = atomWithStorage("biztro:sounds-muted", false)

export const kitchenRowsAtom = atomWithStorage<"2" | "1">(
  "biztro:kitchen-rows",
  "2"
)

export const colorListAtom = atom<ColorTheme[]>([])
