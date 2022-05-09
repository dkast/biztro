import React, { useState } from "react"
import Link from "next/link"
import * as Toolbar from "@radix-ui/react-toolbar"
import {
  ResetIcon,
  MobileIcon,
  DesktopIcon,
  LockClosedIcon,
  LockOpen2Icon,
  Link1Icon
} from "@radix-ui/react-icons"
import lz from "lzutf8"
import { mutate } from "swr"
import toast from "react-hot-toast"
import { QRCode } from "react-qrcode-logo"
import { useEditor } from "@craftjs/core"
import { useSession } from "next-auth/react"
import { useRecoilState, useRecoilValue } from "recoil"
import { ChevronDownIcon, EyeIcon } from "@heroicons/react/solid"
import {
  DuplicateIcon,
  ExternalLinkIcon,
  SaveIcon
} from "@heroicons/react/outline"
import { CopyToClipboard } from "react-copy-to-clipboard"

import {
  ToolbarPopover,
  ToolbarPopoverContent,
  ToolbarPopoverTrigger
} from "@/components/editor/ToolbarPopover"
import useSite from "@/hooks/useSite"
import Button from "@/components/Button"
import { frameSizeState, hostState } from "@/lib/store"

import { frameSize, HttpMethod } from "@/lib/types"
import { Dialog, DialogContent, DialogTrigger } from "@/components/Dialog"
import {
  ToolbarDropdown,
  ToolbarDropdownContent,
  ToolbarDropdownItem,
  ToolbarDropdownTrigger
} from "./ToolbarDropdown"

const ToolbarMenu = () => {
  const { enabled, canUndo, canRedo, actions, query } = useEditor(
    (state, query) => ({
      enabled: state.options.enabled,
      canUndo: query.history.canUndo(),
      canRedo: query.history.canRedo()
    })
  )
  const [size, setSize] = useRecoilState(frameSizeState)

  const { data: session } = useSession()
  const sessionId = session?.user?.id

  const { site } = useSite(sessionId)

  async function updateSite(): Promise<void> {
    const toastId = toast.loading("Guardando...")
    const json = query.serialize()

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
    toast.dismiss(toastId)

    if (res.ok) {
      toast.success("Información actualizada")
      mutate("/api/site")
    } else {
      toast.error("Algo salió mal")
    }
  }

  async function publishSite(published: boolean): Promise<void> {
    const toastId = toast.loading("Guardando...")
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
        published,
        serialData: lz.encodeBase64(lz.compress(json))
      })
    })
    toast.dismiss(toastId)

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
          <DialogTrigger className="ml-auto" asChild>
            <Button
              type="button"
              variant="flat"
              size="xs"
              leftIcon={<EyeIcon className="text-gray-500" />}
            >
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
          variant="flat"
          size="xs"
          className="mr-2"
          leftIcon={<SaveIcon className="text-gray-500" />}
          onClick={() => updateSite()}
        >
          Guardar
        </Button>
      </Toolbar.Button>
      {!site.published ? (
        <Toolbar.Button asChild>
          <Button
            type="button"
            variant="primary"
            size="xs"
            onClick={() => publishSite(true)}
          >
            Publicar
          </Button>
        </Toolbar.Button>
      ) : (
        <ToolbarDropdown>
          <ToolbarDropdownTrigger className="outline-none">
            <Button
              type="button"
              variant="primary"
              size="xs"
              rightIcon={<ChevronDownIcon />}
            >
              Publicado
            </Button>
          </ToolbarDropdownTrigger>
          <ToolbarDropdownContent>
            <ToolbarDropdownItem>Cambiar a Borrador</ToolbarDropdownItem>
          </ToolbarDropdownContent>
        </ToolbarDropdown>
      )}
      <Toolbar.Separator className="mx-2 inline-flex h-6 border-l border-gray-200" />
      <ToolbarPopover>
        <ToolbarPopoverTrigger asChild>
          <Toolbar.Button
            aria-label="Compartir"
            className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-100 disabled:text-gray-300"
          >
            <Link1Icon />
          </Toolbar.Button>
        </ToolbarPopoverTrigger>
        <ToolbarPopoverContent>
          <PublishPanel siteId={site.id} />
        </ToolbarPopoverContent>
      </ToolbarPopover>
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

interface PublishPanelProps {
  siteId: string
}

const PublishPanel = ({ siteId }: PublishPanelProps): JSX.Element => {
  const host = useRecoilValue(hostState)
  const [copy, setCopy] = useState(false)
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
      <div className="flex flex-col gap-4 divide-y divide-solid px-2 py-3 sm:p-4">
        <div className="flex items-center justify-center gap-4">
          <span className="select-all text-xs">{`${host}/site/${siteId}`}</span>
          <Link href={`/site/${siteId}`} passHref>
            <a
              className="rounded bg-gray-100 p-1 text-gray-500 hover:text-gray-700"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLinkIcon className="h-4 w-4" />
            </a>
          </Link>
        </div>
        <div className="pt-2">
          <CopyToClipboard
            text={`${host}/site/${siteId}`}
            onCopy={() => setCopy(true)}
          >
            <Button
              type="button"
              variant="flat"
              mode="full"
              size="xs"
              leftIcon={!copy && <DuplicateIcon className="h-4 w-4" />}
            >
              {copy ? "Listo" : "Copiar URL"}
            </Button>
          </CopyToClipboard>
        </div>
      </div>
    </div>
  )
}
