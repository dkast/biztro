import React, { useEffect, useState } from "react"
import { useEditor, useNode } from "@craftjs/core"
import Link from "next/link"

export default function NavigatorBlock() {
  const {
    connectors: { connect }
  } = useNode()

  const { nodes } = useEditor(state => ({
    nodes: state.nodes
  }))

  const [ids, setIds] = useState<string[]>([])
  const [displayNames, setDisplayNames] = useState<string[]>([])

  useEffect(() => {
    setIds(
      Object.values(nodes)
        .filter(
          node =>
            node.data.name === "CategoryBlock" ||
            node.data.name === "HeadingElement"
        )
        .map(node => node.id)
    )
    setDisplayNames(
      Object.values(nodes)
        .filter(
          node =>
            node.data.name === "CategoryBlock" ||
            node.data.name === "HeadingElement"
        )
        .map(node => {
          if (node.data.name === "CategoryBlock") {
            return node.data.props.data.name
          } else {
            return node.data.props.text
          }
        })
    )
  }, [nodes])

  return (
    <nav
      ref={ref => {
        if (ref) {
          connect(ref)
        }
      }}
      className="p-4"
    >
      {ids.length === 0 ? (
        <p className="text-gray-500">Navegador</p>
      ) : (
        <ul className="space-y-2">
          {ids.map((id, index) => (
            <li key={id}>
              <Link href={`#${id}`}>Go to {displayNames[index]}</Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  )
}

NavigatorBlock.craft = {
  displayName: "Navegador",
  props: {
    ids: []
  }
}
