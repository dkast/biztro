import { useEditor, useNode } from "@craftjs/core"
import { Paintbrush } from "lucide-react"

import { type ItemBlockProps } from "@/components/menu-editor/blocks/item-block"
import {
  EditorSettingRow,
  EditorSettingSegmented,
  EditorSettingSelect
} from "@/components/menu-editor/settings/editor-setting-row"
import { FontSizeSlider } from "@/components/menu-editor/settings/font-size-slider"
import {
  FONT_WEIGHT_OPTIONS,
  TEXT_TRANSFORM_OPTIONS
} from "@/components/menu-editor/settings/settings-options"
import SideSection from "@/components/menu-editor/side-section"
import { Button } from "@/components/ui/button"
import { SelectItem } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"

export default function ItemSettings() {
  const {
    id,
    actions: { setProp },
    backgroundMode,
    itemFontSize,
    itemFontWeight,
    itemTextTransform,
    priceFontSize,
    priceFontWeight,
    showImage
  } = useNode(node => ({
    backgroundMode: node.data.props.backgroundMode,
    categoryFontSize: node.data.props.categoryFontSize,
    categoryColor: node.data.props.categoryColor,
    categoryFontWeight: node.data.props.categoryFontWeight,
    categoryTextAlign: node.data.props.categoryTextAlign,
    itemFontSize: node.data.props.itemFontSize,
    itemColor: node.data.props.itemColor,
    itemFontWeight: node.data.props.itemFontWeight,
    itemTextTransform: node.data.props.itemTextTransform,
    priceFontSize: node.data.props.priceFontSize,
    priceColor: node.data.props.priceColor,
    priceFontWeight: node.data.props.priceFontWeight,
    showImage: node.data.props.showImage
  }))

  const { actions: editorActions, nodes } = useEditor(state => ({
    nodes: state.nodes
  }))

  const applyToAll = () => {
    const styleProps = {
      backgroundMode,
      itemFontSize,
      itemFontWeight,
      itemTextTransform: itemTextTransform ?? "none",
      priceFontSize,
      priceFontWeight,
      showImage
    }
    for (const [key, value] of Object.entries(nodes)) {
      if (key === id) continue
      if (value.data?.name === "ItemBlock") {
        editorActions.history.ignore().setProp(key, props => {
          Object.assign(props, styleProps)
        })
      }
    }
  }

  return (
    <>
      <SideSection title="General">
        <EditorSettingRow label="Fondo">
          <EditorSettingSelect
            ariaLabel="Fondo del producto"
            value={backgroundMode}
            onValueChange={value =>
              setProp(
                (props: ItemBlockProps) =>
                  (props.backgroundMode = value as "none" | "custom")
              )
            }
          >
            <SelectItem value="none">Ninguno</SelectItem>
            <SelectItem value="custom">Personalizado</SelectItem>
          </EditorSettingSelect>
        </EditorSettingRow>
      </SideSection>
      <SideSection title="Producto">
        <FontSizeSlider
          value={itemFontSize}
          onValueChange={size =>
            setProp((props: ItemBlockProps) => (props.itemFontSize = size))
          }
        />
        <EditorSettingRow label="Estilo">
          <EditorSettingSelect
            ariaLabel="Estilo del producto"
            value={itemFontWeight}
            onValueChange={value =>
              setProp((props: ItemBlockProps) => (props.itemFontWeight = value))
            }
          >
            {FONT_WEIGHT_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </EditorSettingSelect>
        </EditorSettingRow>
        <EditorSettingRow label="Capitaliza">
          <EditorSettingSegmented
            value={itemTextTransform ?? "none"}
            options={TEXT_TRANSFORM_OPTIONS}
            onValueChange={value =>
              setProp(
                (props: ItemBlockProps) =>
                  (props.itemTextTransform =
                    value as ItemBlockProps["itemTextTransform"])
              )
            }
          />
        </EditorSettingRow>
      </SideSection>
      <SideSection title="Precio">
        <FontSizeSlider
          value={priceFontSize}
          onValueChange={size =>
            setProp((props: ItemBlockProps) => (props.priceFontSize = size))
          }
        />
        <EditorSettingRow label="Estilo">
          <EditorSettingSelect
            ariaLabel="Estilo del precio"
            value={priceFontWeight}
            onValueChange={value =>
              setProp(
                (props: ItemBlockProps) => (props.priceFontWeight = value)
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
      </SideSection>
      <SideSection title="Imágen Producto">
        <EditorSettingRow label="Mostrar">
          <Switch
            className="sm:scale-75"
            aria-label="Mostrar imágen del producto"
            checked={showImage}
            onCheckedChange={checked => {
              setProp(
                (props: Required<ItemBlockProps>) => (props.showImage = checked)
              )
            }}
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
            <p>Propagar estas propiedades a todos los productos</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </>
  )
}
