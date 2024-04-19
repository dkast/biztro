"use client"

import { useRef } from "react"
import toast from "react-hot-toast"
import { QRCode } from "react-qrcode-logo"
import useLocalStorage from "@/hooks/use-local-storage"
import { useEditor } from "@craftjs/core"
import type { Prisma } from "@prisma/client"
import { useQueryClient } from "@tanstack/react-query"
import { rgbaToHex, rgbaToHsva, Sketch, type RgbaColor } from "@uiw/react-color"
import {
  Download,
  ExternalLink,
  Globe,
  Loader,
  QrCodeIcon,
  Save
} from "lucide-react"
import lz from "lzutf8"
import { useAction } from "next-safe-action/hooks"
import Link from "next/link"

import { TooltipHelper } from "@/components/dashboard/tooltip-helper"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { updateMenuStatus } from "@/server/actions/menu/mutations"
import type { getMenuById } from "@/server/actions/menu/queries"
import exportAsImage from "@/lib/export-as-image"
import { MenuStatus } from "@/lib/types"
import { getBaseUrl } from "@/lib/utils"

export default function MenuPublish({
  menu
}: {
  menu: Prisma.PromiseReturnType<typeof getMenuById>
}) {
  const { query, actions } = useEditor()
  const queryClient = useQueryClient()

  const { execute, status, reset } = useAction(updateMenuStatus, {
    onSuccess: data => {
      if (data.success) {
        toast.success("Menú actualizado")
        queryClient.invalidateQueries({
          queryKey: ["menu", menu?.id]
        })
        // Reset history to avoid undoing the update
        actions.history.clear()
      } else if (data.failure.reason) {
        toast.error(data.failure.reason)
      }
      reset()
    },
    onError: () => {
      toast.error("Ocurrió un error al actualizar el menú")
      reset()
    }
  })

  if (!menu) return null

  const handleSave = (status: MenuStatus) => {
    const json = query.serialize()
    const serialData = lz.encodeBase64(lz.compress(json))
    execute({
      id: menu?.id,
      subdomain: menu.organization.subdomain,
      status,
      serialData
    })
  }

  return (
    <div className="flex justify-end gap-2">
      <TooltipHelper content="Guardar cambios">
        <Button size="xs" variant="outline">
          <Save className="size-4" />
        </Button>
      </TooltipHelper>
      <Dialog>
        <TooltipHelper content="Generar código QR">
          <DialogTrigger asChild>
            <Button size="xs" variant="outline">
              <QrCodeIcon className="size-4" />
            </Button>
          </DialogTrigger>
        </TooltipHelper>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generar código QR</DialogTitle>
            <DialogDescription>
              Al escanear el código con la cámara de tu móvil o aplicación QR te
              llevará a la siguiente dirección:{" "}
              <Link
                href={`${getBaseUrl()}/${menu.organization.subdomain}`}
                className="text-violet-500 hover:text-violet-700"
                target="_blank"
                rel="noopener noreferrer"
              >
                {`${getBaseUrl()}/${menu.organization.subdomain}`}
              </Link>
            </DialogDescription>
          </DialogHeader>
          <QrCodeEditor
            value={`${getBaseUrl()}/${menu.organization.subdomain}`}
            logoURL={menu.organization.logo ?? undefined}
          />
        </DialogContent>
      </Dialog>
      <Popover>
        <PopoverTrigger asChild>
          <Button size="xs">Publicar</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          {menu.status === MenuStatus.DRAFT ? (
            <div className="flex flex-col items-center gap-2">
              <span className="rounded-full bg-green-50 p-1 text-green-700">
                <Globe className="size-5" />
              </span>
              <span className="text-sm font-medium">Publicar Menú</span>
              <span className="text-xs text-gray-600">
                Publica tu menú a una URL pública que puedes compartir.
              </span>
              <Button
                size="xs"
                className="mt-2 w-full"
                onClick={() => handleSave(MenuStatus.PUBLISHED)}
              >
                {status === "executing" ? (
                  <Loader className="size-4 animate-spin" />
                ) : (
                  "Publicar"
                )}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Liga Menú</span>
              <div className="flex flex-row items-center gap-1">
                <Link
                  href={`/${menu.organization.subdomain}`}
                  className="flex flex-row items-center justify-center gap-2"
                  target="_blank"
                >
                  <span className="text-xs">
                    {getBaseUrl()}/{menu.organization.subdomain}
                  </span>
                  <ExternalLink className="size-3.5 text-gray-500" />
                </Link>
              </div>
              <div className="space-y-1">
                <Button
                  size="xs"
                  className="mt-2 w-full"
                  onClick={() => handleSave(menu.status as MenuStatus)}
                >
                  {status === "executing" ? (
                    <Loader className="size-4 animate-spin" />
                  ) : (
                    "Actualizar"
                  )}
                </Button>
                <Button
                  size="xs"
                  className="w-full"
                  variant="outline"
                  onClick={() => handleSave(MenuStatus.DRAFT)}
                >
                  Cambiar a borrador
                </Button>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}

function QrCodeEditor({
  value,
  logoURL,
  fgColor = { r: 0, g: 0, b: 0, a: 1 }
}: {
  value: string
  logoURL?: string
  fgColor?: RgbaColor
}) {
  const exportRef = useRef<HTMLDivElement | null>(null)
  const [color, setColor] = useLocalStorage<
    Record<"r" | "g" | "b" | "a", number>
  >("color", fgColor)
  const [showLogo, setShowLogo] = useLocalStorage<boolean>("logo", false)
  return (
    <div>
      <div className="my-6 flex flex-row items-start justify-between">
        <div className="flex grow items-center justify-center">
          <div className="rounded-lg border-2 border-dashed border-gray-300">
            <div ref={exportRef} className="p-1">
              <QRCode
                value={value}
                size={200}
                ecLevel={showLogo ? "H" : "M"}
                logoImage={showLogo ? logoURL : ""}
                logoWidth={showLogo ? 80 : 0}
                removeQrCodeBehindLogo={showLogo}
                enableCORS
                fgColor={rgbaToHex(color)}
              />
            </div>
          </div>
        </div>
        <div className="min-w-40">
          <form className="grid w-full items-start gap-6">
            <fieldset className="grid gap-6 rounded-lg border p-4">
              <legend className="-ml-1 px-1 text-sm font-medium">
                Ajustes
              </legend>
              <div className="grid gap-3">
                <Label htmlFor="color">Color</Label>
                <Popover>
                  <PopoverTrigger>
                    <div
                      className="h-6 w-12 rounded border border-black/20"
                      style={{
                        backgroundColor: `rgb(${Object.values(color)})`
                      }}
                    ></div>
                  </PopoverTrigger>
                  <PopoverContent className="border-0 p-0 shadow-none">
                    <Sketch
                      disableAlpha
                      color={rgbaToHsva(color)}
                      onChange={color => {
                        setColor(color.rgba)
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="logo">Mostrar Logo</Label>
                <Switch
                  checked={showLogo}
                  onCheckedChange={checked => {
                    setShowLogo(checked)
                  }}
                />
              </div>
            </fieldset>
          </form>
        </div>
      </div>
      <div className="flex justify-center">
        <Button
          className="mt-4 w-full space-x-2"
          onClick={() =>
            exportRef.current && exportAsImage(exportRef.current, "imagen_qr")
          }
        >
          <Download className="size-4" />
          <span>Descargar imágen QR</span>
        </Button>
      </div>
    </div>
  )
}
