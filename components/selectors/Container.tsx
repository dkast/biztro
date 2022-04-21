import React from "react"
import { useNode, UserComponent } from "@craftjs/core"

interface ContainerProps {
  background?: Record<"r" | "g" | "b" | "a", number>
  children: React.ReactNode
}

const Container: UserComponent<ContainerProps> = ({ background, children }) => {
  const {
    connectors: { connect, drag }
  } = useNode()
  return (
    <div
      className="flex flex-1 flex-col px-4"
      ref={ref => connect(drag(ref))}
      style={{
        backgroundColor: `rgba(${Object.values(background)})`
      }}
    >
      {children}
    </div>
  )
}

Container.craft = {
  displayName: "Contenedor",
  props: {
    background: { r: 255, g: 255, b: 255, a: 1 }
  }
}

export default Container
