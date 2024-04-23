import { useNode } from "@craftjs/core"
import { rgbaToHsva, Sketch } from "@uiw/react-color"
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react"

import type { TextElementProps } from "@/components/menu-editor/blocks/text-element"
import SideSection from "@/components/menu-editor/side-section"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FONT_SIZES, FONTS } from "@/lib/types"

export default function TextSettings() {
  const {
    actions: { setProp },
    fontSize,
    color,
    textAlign,
    fontWeight,
    fontFamily
  } = useNode(node => ({
    fontSize: node.data.props.fontSize,
    color: node.data.props.color,
    textAlign: node.data.props.textAlign,
    fontWeight: node.data.props.fontWeight,
    fontFamily: node.data.props.fontFamily
  }))

  return (
    <>
      <SideSection title="Texto">
        <div className="grid grid-cols-3 items-center gap-2">
          <dt>
            <Label size="sm">Tamaño</Label>
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
              <SelectTrigger className="h-7 text-xs focus:ring-0">
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
            <Label size="sm">Color</Label>
          </dt>
          <dd className="col-span-2 flex items-center">
            <Popover>
              <PopoverTrigger>
                <div
                  className="h-5 w-12 rounded border border-black/10"
                  style={{
                    backgroundColor: `rgb(${Object.values(color)})`
                  }}
                ></div>
              </PopoverTrigger>
              <PopoverContent className="border-0 p-0 shadow-none">
                <Sketch
                  disableAlpha
                  color={rgbaToHsva(color)}
                  onChange={color =>
                    setProp(
                      (props: TextElementProps) => (props.color = color.rgba)
                    )
                  }
                />
              </PopoverContent>
            </Popover>
          </dd>
          <dt>
            <Label size="sm">Estilo</Label>
          </dt>
          <dd className="col-span-2 flex items-center">
            <Select
              value={fontWeight}
              onValueChange={value =>
                setProp((props: TextElementProps) => (props.fontWeight = value))
              }
            >
              <SelectTrigger className="h-7 text-xs focus:ring-0">
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="200">Light</SelectItem>
                <SelectItem value="400">Regular</SelectItem>
                <SelectItem value="500">Medium</SelectItem>
                <SelectItem value="600">Negrita</SelectItem>
              </SelectContent>
            </Select>
          </dd>
          <dt>
            <Label size="sm">Alineación</Label>
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
          <dt>
            <Label size="sm">Fuente</Label>
          </dt>
          <dd className="col-span-2 flex items-center">
            <Select
              value={fontFamily}
              onValueChange={value =>
                setProp((props: TextElementProps) => (props.fontFamily = value))
              }
            >
              <SelectTrigger className="h-7 text-xs focus:ring-0">
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                {FONTS.map(font => (
                  <SelectItem key={font} value={font}>
                    {font}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </dd>
        </div>
      </SideSection>
    </>
  )
}
