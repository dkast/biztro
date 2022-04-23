import React from "react"
import { useNode, UserComponent } from "@craftjs/core"

import ContainerSettings from "@/components/selectors/Container/ContainerSettings"

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
      className="flex flex-1 flex-col gap-4 px-4"
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
  displayName: "Sección",
  props: {
    background: { r: 255, g: 255, b: 255, a: 1 }
  },
  related: {
    toolbar: ContainerSettings
  }
}

export default Container
