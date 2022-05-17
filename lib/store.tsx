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

export const propState = atom({
  key: "propState",
  default: null
})

export const syncReqState = atom({
  key: "syncReqState",
  default: false
})
