import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  CaseSensitive,
  CaseUpper
} from "lucide-react"

import type { EditorSettingSegmentedOption } from "@/components/menu-editor/settings/editor-setting-row"

export const FONT_WEIGHT_OPTIONS = [
  { value: "300", label: "Light" },
  { value: "400", label: "Regular" },
  { value: "500", label: "Medium" },
  { value: "700", label: "Negrita" }
] as const

export const TEXT_ALIGN_OPTIONS: readonly EditorSettingSegmentedOption[] = [
  { value: "left", icon: AlignLeft, label: "Alinear a la izquierda" },
  { value: "center", icon: AlignCenter, label: "Centrar" },
  { value: "right", icon: AlignRight, label: "Alinear a la derecha" }
]

export const TEXT_TRANSFORM_OPTIONS: readonly EditorSettingSegmentedOption[] = [
  { value: "none", icon: CaseSensitive, label: "Capitalización normal" },
  { value: "uppercase", icon: CaseUpper, label: "Capitalización en mayúsculas" }
]
