"use client"

import { Editor, Frame } from "@craftjs/core"

import CategoryBlock from "@/components/menu-editor/blocks/category-block"
import ContainerBlock from "@/components/menu-editor/blocks/container-block"
import HeaderBlock from "@/components/menu-editor/blocks/header-block"
import HeadingElement from "@/components/menu-editor/blocks/heading-element"
import ItemBlock from "@/components/menu-editor/blocks/item-block"
import NavigatorBlock from "@/components/menu-editor/blocks/navigator-block"
import TextElement from "@/components/menu-editor/blocks/text-element"

export default function ResolveEditor({ json }: { json: string }) {
  return (
    <Editor
      resolver={{
        ContainerBlock,
        HeaderBlock,
        HeadingElement,
        TextElement,
        CategoryBlock,
        ItemBlock,
        NavigatorBlock
      }}
      enabled={false}
    >
      <Frame data={json} />
    </Editor>
  )
}
