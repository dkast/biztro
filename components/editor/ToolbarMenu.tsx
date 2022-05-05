import React, { useState } from "react"
import Link from "next/link"
import * as Toolbar from "@radix-ui/react-toolbar"
import {
  ResetIcon,
  MobileIcon,
  DesktopIcon,
  LockClosedIcon,
  LockOpen2Icon
} from "@radix-ui/react-icons"
import lz from "lzutf8"
import { mutate } from "swr"
import toast from "react-hot-toast"
import { QRCode } from "react-qrcode-logo"
import { useEditor } from "@craftjs/core"
import { useSession } from "next-auth/react"
import { useRecoilState, useRecoilValue } from "recoil"

import useSite from "@/hooks/useSite"
import Button from "@/components/Button"
import { frameSizeState, hostState } from "@/lib/store"

import { frameSize, HttpMethod } from "@/lib/types"
import { Dialog, DialogContent, DialogTrigger } from "@/components/Dialog"

const ToolbarMenu = () => {
  const { enabled, canUndo, canRedo, actions, query } = useEditor(
    (state, query) => ({
      enabled: state.options.enabled,
      canUndo: query.history.canUndo(),
      canRedo: query.history.canRedo()
    })
  )
  const [size, setSize] = useRecoilState(frameSizeState)

  const [submitted, setSubmitted] = useState(false)
  const { data: session } = useSession()
  const sessionId = session?.user?.id

  const { site } = useSite(sessionId)

  async function updateSite(): Promise<void> {
    setSubmitted(true)
    const json = query.serialize()
    // console.dir(json)
    // console.log(lz.encodeBase64(lz.compress(json)))
    const res = await fetch("/api/site", {
      method: HttpMethod.PUT,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: site.id,
        serialData: lz.encodeBase64(lz.compress(json))
      })
    })
    setSubmitted(false)

    if (res.ok) {
      toast.success("Información actualizada")
      mutate("/api/site")
    } else {
      toast.error("Algo salió mal")
    }
  }

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
        <Dialog>
          <DialogTrigger className="ml-auto mr-2">
            <Button type="button" variant="flat" size="xs">
              Vista Previa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <QRPreview />
          </DialogContent>
        </Dialog>
      </Toolbar.Button>
      <Toolbar.Button asChild>
        <Button
          type="button"
          variant="primary"
          size="xs"
          onClick={() => updateSite()}
          isLoading={submitted}
        >
          Guardar
        </Button>
      </Toolbar.Button>
    </Toolbar.Root>
  )
}

export default ToolbarMenu

const QRPreview = (): JSX.Element => {
  const host = useRecoilValue(hostState)
  return (
    <>
      <h3 className="text-lg font-medium leading-6 text-gray-900">
        Abrir en Móvil
      </h3>
      <div className="flex flex-col items-center justify-center">
        <span className="my-2 text-gray-500">
          Escanea con la cámara de tu móvil o aplicación QR o sigue{" "}
          <Link href="/app/site-preview">
            <a className="text-indigo-500 hover:text-indigo-700">esta liga.</a>
          </Link>
        </span>
        <QRCode value={`${host}/app/site-preview`} />
      </div>
    </>
  )
}
