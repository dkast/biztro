import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"

import { FrameSize } from "@/lib/types"

export const elementPropsAtom = atom<{ [x: string]: unknown }>({})

export const frameSizeAtom = atomWithStorage("frameSize", FrameSize.MOBILE)

export const fontThemeAtom = atom("DEFAULT")

export const colorThemeAtom = atom("DEFAULT")
