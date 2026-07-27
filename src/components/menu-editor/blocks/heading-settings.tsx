import { useEditor, useNode } from "@craftjs/core"
import { Paintbrush } from "lucide-react"

import { type HeadingElementProps } from "@/components/menu-editor/blocks/heading-element"
import {
  EditorSettingRow,
  EditorSettingSegmented,
  EditorSettingSelect
} from "@/components/menu-editor/settings/editor-setting-row"
import { FontSizeSlider } from "@/components/menu-editor/settings/font-size-slider"
import {
  FONT_WEIGHT_OPTIONS,
  TEXT_ALIGN_OPTIONS
} from "@/components/menu-editor/settings/settings-options"
import SideSection from "@/components/menu-editor/side-section"
import { Button } from "@/components/ui/button"
import { SelectItem } from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"

export default function HeadingSettings() {
  const {
    id,
    actions: { setProp },
    fontSize,
    textAlign,
    fontWeight
  } = useNode(node => ({
    fontSize: node.data.props.fontSize,
    color: node.data.props.color,
    textAlign: node.data.props.textAlign,
    fontWeight: node.data.props.fontWeight,
    fontFamily: node.data.props.fontFamily
  }))

  const { actions: editorActions, nodes } = useEditor(state => ({
    nodes: state.nodes
  }))

  const applyToAll = () => {
    const styleProps = { fontSize, fontWeight, textAlign }
    for (const [key, value] of Object.entries(nodes)) {
      if (key === id) continue
      if (value.data?.name === "HeadingElement") {
        editorActions.history.ignore().setProp(key, props => {
          Object.assign(props, styleProps)
        })
      }
    }
  }

  return (
    <>
      <SideSection title="Texto">
        <FontSizeSlider
          value={fontSize}
          onValueChange={size =>
            setProp((props: HeadingElementProps) => (props.fontSize = size))
          }
        />
        <EditorSettingRow label="Estilo">
          <EditorSettingSelect
            ariaLabel="Estilo de texto"
            value={fontWeight}
            onValueChange={value =>
              setProp(
                (props: HeadingElementProps) => (props.fontWeight = value)
              )
            }
          >
            {FONT_WEIGHT_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </EditorSettingSelect>
        </EditorSettingRow>
        <EditorSettingRow label="Alineación">
          <EditorSettingSegmented
            value={textAlign}
            options={TEXT_ALIGN_OPTIONS}
            onValueChange={value =>
              setProp((props: HeadingElementProps) => (props.textAlign = value))
            }
          />
        </EditorSettingRow>
      </SideSection>
      <div className="px-4 py-3">
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <Button
              variant="secondary"
              size="sm"
              className="w-full gap-1.5 text-xs"
              onClick={applyToAll}
            >
              <Paintbrush className="size-3.5" />
              Aplicar a todos
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Propagar estas propiedades a todos los encabezados</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </>
  )
}
