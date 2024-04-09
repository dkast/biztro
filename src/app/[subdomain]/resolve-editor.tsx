"use client"

import { Editor, Frame } from "@craftjs/core"

import CategoryBlock from "@/components/menu-editor/blocks/category-block"
import ContainerBlock from "@/components/menu-editor/blocks/container-block"
import HeaderBlock from "@/components/menu-editor/blocks/header-block"
import TextElement from "@/components/menu-editor/blocks/text-element"

export default function ResolveEditor({ json }: { json: string }) {
  return (
    <Editor
      resolver={{ ContainerBlock, HeaderBlock, TextElement, CategoryBlock }}
      enabled={false}
    >
      <Frame data={json} />
    </Editor>
  )
}
