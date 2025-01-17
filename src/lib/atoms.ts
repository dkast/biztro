import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"

import { FrameSize, type colorThemes } from "@/lib/types"

export const elementPropsAtom = atom<{ [x: string]: unknown }>({})

export const frameSizeAtom = atomWithStorage("frameSize", FrameSize.MOBILE)

export const fontThemeAtom = atom("DEFAULT")

export const colorThemeAtom = atom("DEFAULT")

export const tourModeAtom = atomWithStorage("tourMode", true)

export const onboardingCardsCollapsedAtom = atomWithStorage(
  "onboardingCardsCollapsed",
  false
)

export const colorListAtom = atom<(typeof colorThemes)[0][]>([])
