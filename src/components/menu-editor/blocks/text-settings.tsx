import { useEditor, useNode } from "@craftjs/core"
import { AlignCenter, AlignLeft, AlignRight, Paintbrush } from "lucide-react"

import { type TextElementProps } from "@/components/menu-editor/blocks/text-element"
import SideSection from "@/components/menu-editor/side-section"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { FONT_SIZES } from "@/lib/types/theme"

export default function TextSettings() {
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
      if (value.data?.name === "TextElement") {
        editorActions.history.ignore().setProp(key, props => {
          Object.assign(props, styleProps)
        })
      }
    }
  }

  return (
    <>
      <SideSection title="Texto">
        <div className="grid grid-cols-3 items-center gap-2">
          <dt>
            <Label size="xs">Tamaño</Label>
          </dt>
          <dd className="col-span-2 flex items-center">
            <Select
              value={fontSize.toString()}
              onValueChange={value =>
                setProp(
                  (props: TextElementProps) =>
                    (props.fontSize = parseInt(value))
                )
              }
            >
              <SelectTrigger
                className="focus:ring-transparent sm:h-7! sm:text-xs"
              >
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                {FONT_SIZES.map(size => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </dd>
          <dt>
            <Label size="xs">Estilo</Label>
          </dt>
          <dd className="col-span-2 flex items-center">
            <Select
              value={fontWeight}
              onValueChange={value =>
                setProp((props: TextElementProps) => (props.fontWeight = value))
              }
            >
              <SelectTrigger
                className="focus:ring-transparent sm:h-7! sm:text-xs"
              >
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="300">Light</SelectItem>
                <SelectItem value="400">Regular</SelectItem>
                <SelectItem value="500">Medium</SelectItem>
                <SelectItem value="700">Negrita</SelectItem>
              </SelectContent>
            </Select>
          </dd>
          <dt>
            <Label size="xs">Alineación</Label>
          </dt>
          <dd className="col-span-2">
            <Tabs
              value={textAlign}
              onValueChange={value =>
                setProp((props: TextElementProps) => (props.textAlign = value))
              }
              // className="text-center"
            >
              <TabsList className="h-8 p-0.5">
                <TabsTrigger value="left">
                  <AlignLeft className="size-3.5" />
                </TabsTrigger>
                <TabsTrigger value="center">
                  <AlignCenter className="size-3.5" />
                </TabsTrigger>
                <TabsTrigger value="right">
                  <AlignRight className="size-3.5" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </dd>
        </div>
      </SideSection>
      <div className="px-4 py-3">
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5 text-xs"
              onClick={applyToAll}
            >
              <Paintbrush className="size-3.5" />
              Aplicar a todos
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Propagar estas propiedades a todos los textos</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </>
  )
}
