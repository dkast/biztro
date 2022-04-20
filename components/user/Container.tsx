import React from "react"
import { useNode } from "@craftjs/core"

const Container = ({ bgColor, children }) => {
  const {
    connectors: { connect, drag }
  } = useNode()
  return (
    <div className="bg-gray-400" ref={ref => connect(drag(ref))}>
      {children}
    </div>
  )
}

export default Container
