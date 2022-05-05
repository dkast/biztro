import { atom } from "recoil"

import { frameSize } from "@/lib/types"

export const frameSizeState = atom({
  key: "frameSizeState",
  default: frameSize.MOBILE
})

export const hostState = atom({
  key: "hostState",
  default: ""
})
