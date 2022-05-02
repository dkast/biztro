import React from "react"
import * as Toolbar from "@radix-ui/react-toolbar"
import { ResetIcon, MobileIcon, DesktopIcon } from "@radix-ui/react-icons"

const ToolbarMenu = () => {
  return (
    <Toolbar.Root className="flex h-full w-full items-center gap-1 px-4">
      <Toolbar.Button
        aria-label="Deshacer"
        className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-100"
      >
        <ResetIcon />
      </Toolbar.Button>
      <Toolbar.Button
        aria-label="Rehacer"
        className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-100"
      >
        <ResetIcon
          style={{
            transform: "scaleX(-1)"
          }}
        />
      </Toolbar.Button>
      <Toolbar.Separator className="mx-2 inline-flex h-6 border-l border-gray-200" />
      <Toolbar.ToggleGroup
        type="single"
        defaultValue="mobile"
        aria-label="Tamaño Vista Previa"
        className="inline-flex rounded bg-gray-100 p-0.5"
      >
        <Toolbar.ToggleItem
          value="mobile"
          className="flex h-6 w-6 items-center justify-center rounded bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 radix-state-on:bg-white radix-state-on:shadow"
        >
          <MobileIcon />
        </Toolbar.ToggleItem>
        <Toolbar.ToggleItem
          value="desktop"
          className="flex h-6 w-6 items-center justify-center rounded bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 radix-state-on:bg-white radix-state-on:shadow"
        >
          <DesktopIcon />
        </Toolbar.ToggleItem>
      </Toolbar.ToggleGroup>
      <Toolbar.Link
        href="#"
        className="ml-auto inline-flex h-6 items-center justify-center justify-self-end rounded px-2 text-sm hover:bg-gray-100"
      >
        Vista Previa
      </Toolbar.Link>
      <Toolbar.Button className="inline-flex h-6 items-center justify-center rounded border border-transparent bg-zinc-800 p-2 text-sm font-medium text-white hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-700 focus:ring-offset-2 active:bg-zinc-900">
        Guardar
      </Toolbar.Button>
    </Toolbar.Root>
  )
}

export default ToolbarMenu
