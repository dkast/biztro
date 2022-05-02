import React from "react"
import * as Toolbar from "@radix-ui/react-toolbar"
import { ResetIcon } from "@radix-ui/react-icons"

const ToolbarMenu = () => {
  return (
    <Toolbar.Root>
      <Toolbar.Button>
        <ResetIcon />
      </Toolbar.Button>
    </Toolbar.Root>
  )
}

export default ToolbarMenu
