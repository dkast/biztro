import useSite from "@/hooks/useSite"
import useWarnChanges from "@/hooks/useWarnChanges"
import { useEditor } from "@craftjs/core"
import {
  DuplicateIcon,
  ExternalLinkIcon,
  SaveIcon
} from "@heroicons/react/outline"
import { ChevronDownIcon, EyeIcon, QrcodeIcon } from "@heroicons/react/solid"
import {
  ClipboardCopyIcon,
  CopyIcon,
  DesktopIcon,
  Link1Icon,
  LockClosedIcon,
  LockOpen2Icon,
  MobileIcon,
  ResetIcon
} from "@radix-ui/react-icons"
import * as Toolbar from "@radix-ui/react-toolbar"
import lz from "lzutf8"
import { useSession } from "next-auth/react"
import Link from "next/link"
import React, { useState } from "react"
import { CopyToClipboard } from "react-copy-to-clipboard"
import toast from "react-hot-toast"
import { QRCode } from "react-qrcode-logo"
import { useRecoilState, useRecoilValue } from "recoil"
import { mutate } from "swr"

import Button from "@/components/Button"
import Dialog from "@/components/Dialog"
import QREditor from "@/components/editor/QREditor"
import {
  ToolbarDropdown,
  ToolbarDropdownContent,
  ToolbarDropdownItem,
  ToolbarDropdownTrigger
} from "@/components/editor/ToolbarDropdown"
import {
  ToolbarPopover,
  ToolbarPopoverContent,
  ToolbarPopoverTrigger
} from "@/components/editor/ToolbarPopover"
import { Tooltip } from "@/components/Tooltip"

import { frameSizeState, hostState, propState } from "@/lib/store"
import { frameSize, HttpMethod } from "@/lib/types"

const ToolbarMenu = () => {
  // Hooks
  const { enabled, canUndo, canRedo, actions, query, selectedNodeId } =
    useEditor((state, query) => ({
      enabled: state.options.enabled,
      canUndo: query.history.canUndo(),
      canRedo: query.history.canRedo(),
      selectedNodeId: state.events.selected
    }))
  const [openDialog, setOpenDialog] = useState(false)
  const [openQR, setOpenQR] = useState(false)
  const { data: session } = useSession()
  const sessionId = session?.user?.id
  const { site } = useSite(sessionId)

  // Atoms
  const [size, setSize] = useRecoilState(frameSizeState)
  const [propsCopy, setPropsCopy] = useRecoilState(propState)

  // Actions
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
        subdomain: site.subdomain,
        serialData: lz.encodeBase64(lz.compress(json))
      })
    })

    if (res.ok) {
      toast.success("Información actualizada", { id: toastId })
      mutate("/api/site")
      void revalidate(site.subdomain)
      // Reset Editor history state
      actions.history.clear()
    } else {
      toast.error("Algo salió mal", { id: toastId })
    }
  }

  async function publishSite(published: boolean): Promise<void> {
    const toastId = toast.loading("Guardando...")
    const res = await fetch("/api/site", {
      method: HttpMethod.PUT,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: site.id,
        subdomain: site.subdomain,
        published
      })
    })

    if (res.ok) {
      toast.success("Información actualizada", { id: toastId })
      mutate("/api/site")
      void revalidate(site.subdomain)
    } else {
      toast.error("Algo salió mal", { id: toastId })
    }
  }

  // Revalidate to build the site with ISR On-Demand
  async function revalidate(siteId): Promise<void> {
    const res = await fetch(`/api/revalidate?site=${siteId}`, {
      method: HttpMethod.GET,
      headers: {
        "content-Type": "application/json"
      }
    })

    if (!res.ok) {
      toast.error("No se pudo actualizar el sitio")
    }
  }

  const onPasteProps = clonedProps => {
    const values = selectedNodeId.values()
    const nodeId = values.next()
    actions.setProp(nodeId.value, props => {
      props = Object.assign(props, clonedProps)
    })
  }

  const onCopyProps = () => {
    const values = selectedNodeId.values()
    const nodeId = values.next()
    if (selectedNodeId) {
      const node = query.node(nodeId.value).get()
      const { item, text, ...propsCopy } = node.data.props
      setPropsCopy(propsCopy)
    }
  }

  useWarnChanges(
    canUndo,
    "Tiene cambios sin guardar - ¿Está seguro de salir del Editor?"
  )

  return (
    <>
      <Toolbar.Root className="flex h-full w-full items-center gap-1 px-4">
        <Tooltip content="Deshacer">
          <Toolbar.Button
            disabled={!canUndo}
            onClick={() => actions.history.undo()}
            aria-label="Deshacer"
            className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-100 active:scale-90 disabled:text-gray-300"
          >
            <ResetIcon />
          </Toolbar.Button>
        </Tooltip>
        <Tooltip content="Rehacer">
          <Toolbar.Button
            disabled={!canRedo}
            onClick={() => actions.history.redo()}
            aria-label="Rehacer"
            className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-100 active:scale-90 disabled:text-gray-300"
          >
            <ResetIcon
              style={{
                transform: "scaleX(-1)"
              }}
            />
          </Toolbar.Button>
        </Tooltip>
        <Toolbar.Separator className="mx-2 inline-flex h-6 border-l border-gray-200" />
        <Tooltip content="Tamaño Pantalla">
          <Toolbar.ToggleGroup
            type="single"
            defaultValue={size}
            aria-label="Tamaño Vista Previa"
            className="inline-flex rounded bg-gray-100 p-0.5"
            onValueChange={(value: frameSize) => setSize(value)}
          >
            <Toolbar.ToggleItem
              value={frameSize.MOBILE}
              className="flex h-6 w-6 items-center justify-center rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-zinc-600 radix-state-on:bg-white radix-state-on:shadow"
            >
              <MobileIcon />
            </Toolbar.ToggleItem>
            <Toolbar.ToggleItem
              value={frameSize.DESKTOP}
              className="flex h-6 w-6 items-center justify-center rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-zinc-600 radix-state-on:bg-white radix-state-on:shadow"
            >
              <DesktopIcon />
            </Toolbar.ToggleItem>
          </Toolbar.ToggleGroup>
        </Tooltip>
        <Toolbar.Separator className="mx-2 inline-flex h-6 border-l border-gray-200" />
        <Tooltip content="Copiar Estilo">
          <Toolbar.Button
            onClick={() => onCopyProps()}
            aria-label="Copiar Estilo"
            className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-100 active:scale-90 disabled:text-gray-300"
          >
            <CopyIcon />
          </Toolbar.Button>
        </Tooltip>
        <Tooltip content="Pegar Estilo">
          <Toolbar.Button
            disabled={!propsCopy}
            onClick={() => onPasteProps(propsCopy)}
            aria-label="Pegar Estilo"
            className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-100 active:scale-90 disabled:text-gray-300"
          >
            <ClipboardCopyIcon />
          </Toolbar.Button>
        </Tooltip>
        <Toolbar.Separator className="mx-2 inline-flex h-6 border-l border-gray-200" />
        <Tooltip content="Restringir cambios">
          <Toolbar.Button
            onClick={() =>
              actions.setOptions(options => (options.enabled = !enabled))
            }
            aria-label="Editor habilitado"
            className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-100 disabled:text-gray-300"
          >
            {enabled ? <LockOpen2Icon /> : <LockClosedIcon />}
          </Toolbar.Button>
        </Tooltip>
        <Toolbar.Button asChild>
          <Button
            type="button"
            variant="flat"
            size="xs"
            className="ml-auto"
            leftIcon={<EyeIcon className="text-gray-500" />}
            onClick={() => setOpenDialog(true)}
          >
            Vista Previa
          </Button>
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
              variant="primary"
              size="xs"
              onClick={() => publishSite(true)}
              renderAs="a"
              className="cursor-pointer"
            >
              Publicar
            </Button>
          </Toolbar.Button>
        ) : (
          <ToolbarDropdown>
            <ToolbarDropdownTrigger className="cursor-pointer outline-none">
              <Button
                variant="primary"
                size="xs"
                rightIcon={<ChevronDownIcon />}
                renderAs="a"
              >
                Publicado
              </Button>
            </ToolbarDropdownTrigger>
            <ToolbarDropdownContent>
              <ToolbarDropdownItem onSelect={() => publishSite(false)}>
                Cambiar a Borrador
              </ToolbarDropdownItem>
            </ToolbarDropdownContent>
          </ToolbarDropdown>
        )}
        <Toolbar.Separator className="mx-2 inline-flex h-6 border-l border-gray-200" />
        <Tooltip content="Código QR">
          <Toolbar.Button
            onClick={() => setOpenQR(true)}
            aria-label="Código QR"
            className="flex h-6 w-6 items-center justify-center rounded text-gray-600 hover:bg-gray-100 active:scale-90 disabled:text-gray-300"
          >
            <QrcodeIcon className="h-5 w-5 text-current" />
          </Toolbar.Button>
        </Tooltip>
        <ToolbarPopover>
          <Tooltip content="Compartir">
            <ToolbarPopoverTrigger asChild>
              <Toolbar.Button
                aria-label="Compartir"
                className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-100 disabled:text-gray-300"
              >
                <Link1Icon />
              </Toolbar.Button>
            </ToolbarPopoverTrigger>
          </Tooltip>
          <ToolbarPopoverContent>
            <PublishPanel siteId={site.subdomain} />
          </ToolbarPopoverContent>
        </ToolbarPopover>
      </Toolbar.Root>
      <Dialog open={openDialog} setOpen={setOpenDialog}>
        <QRPreview />
      </Dialog>
      {/* QR Editor */}
      <Dialog open={openQR} setOpen={setOpenQR}>
        <QREditor siteId={site.subdomain} logo={site?.logo} />
      </Dialog>
    </>
  )
}

export default ToolbarMenu

const QRPreview = (): JSX.Element => {
  const host = useRecoilValue(hostState)
  return <>
    <h3 className="text-lg font-medium leading-6 text-gray-900">
      Abrir en Móvil
    </h3>
    <div className="flex flex-col items-center justify-center">
      <span className="my-2 text-gray-500">
        Escanea con la cámara de tu móvil o aplicación QR o sigue{" "}
        <Link
          href="/app/site-preview"
          passHref
          className="text-violet-500 hover:text-violet-700"
          target="_blank"
          rel="noopener noreferrer">
          
            esta liga.
          
        </Link>
      </span>
      <QRCode value={`${host}/app/site-preview`} />
    </div>
  </>;
}

interface PublishPanelProps {
  siteId: string
}

const PublishPanel = ({ siteId }: PublishPanelProps): JSX.Element => {
  const host = useRecoilValue(hostState)
  const [copy, setCopy] = useState(false)
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
      <div className="flex flex-col">
        <div className="flex items-center justify-center gap-4 px-2 pt-3 sm:p-4">
          <span className="select-all text-xs">{`${host}/${siteId}`}</span>
          <Link
            href={`/${siteId}`}
            passHref
            className="rounded bg-gray-100 p-1 text-gray-500 hover:text-gray-700"
            target="_blank"
            rel="noopener noreferrer">

            <ExternalLinkIcon className="h-4 w-4" />

          </Link>
        </div>
        <div className="bg-gray-100 p-3">
          <CopyToClipboard
            text={`${host}/${siteId}`}
            onCopy={() => setCopy(true)}
          >
            <Button
              type="button"
              variant="secondary"
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
  );
}
