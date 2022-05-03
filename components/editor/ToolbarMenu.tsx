import React from "react"
import * as Toolbar from "@radix-ui/react-toolbar"
import {
  ResetIcon,
  MobileIcon,
  DesktopIcon,
  LockClosedIcon,
  LockOpen2Icon
} from "@radix-ui/react-icons"
import { useEditor } from "@craftjs/core"
import { useRecoilState } from "recoil"

import { frameSizeState } from "@/lib/store"
import { frameSize } from "@/lib/types"
import Button from "@/components/Button"

const ToolbarMenu = () => {
  const { enabled, canUndo, canRedo, actions } = useEditor((state, query) => ({
    enabled: state.options.enabled,
    canUndo: query.history.canUndo(),
    canRedo: query.history.canRedo()
  }))
  const [size, setSize] = useRecoilState(frameSizeState)

  return (
    <Toolbar.Root className="flex h-full w-full items-center gap-1 px-4">
      <Toolbar.Button
        disabled={!canUndo}
        onClick={() => actions.history.undo()}
        aria-label="Deshacer"
        className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-100 disabled:text-gray-300"
      >
        <ResetIcon />
      </Toolbar.Button>
      <Toolbar.Button
        disabled={!canRedo}
        onClick={() => actions.history.redo()}
        aria-label="Rehacer"
        className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-100 disabled:text-gray-300"
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
        defaultValue={size}
        aria-label="Tamaño Vista Previa"
        className="inline-flex rounded bg-gray-100 p-0.5"
        onValueChange={(value: frameSize) => setSize(value)}
      >
        <Toolbar.ToggleItem
          value={frameSize.MOBILE}
          className="flex h-6 w-6 items-center justify-center rounded bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 radix-state-on:bg-white radix-state-on:shadow"
        >
          <MobileIcon />
        </Toolbar.ToggleItem>
        <Toolbar.ToggleItem
          value={frameSize.DESKTOP}
          className="flex h-6 w-6 items-center justify-center rounded bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 radix-state-on:bg-white radix-state-on:shadow"
        >
          <DesktopIcon />
        </Toolbar.ToggleItem>
      </Toolbar.ToggleGroup>
      <Toolbar.Separator className="mx-2 inline-flex h-6 border-l border-gray-200" />
      <Toolbar.Button
        onClick={() =>
          actions.setOptions(options => (options.enabled = !enabled))
        }
        aria-label="Editor habilitado"
        className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-100 disabled:text-gray-300"
      >
        {enabled ? <LockOpen2Icon /> : <LockClosedIcon />}
      </Toolbar.Button>
      <Toolbar.Button asChild>
        <Button type="button" variant="flat" size="xs" className="ml-auto mr-2">
          Vista Previa
        </Button>
      </Toolbar.Button>
      <Toolbar.Button asChild>
        <Button type="button" variant="primary" size="xs">
          Guardar
        </Button>
      </Toolbar.Button>
    </Toolbar.Root>
  )
}

export default ToolbarMenu
