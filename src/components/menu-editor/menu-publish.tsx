"use client"

import { useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"
import { QRCode } from "react-qrcode-logo"
import { useEditor } from "@craftjs/core"
import type { Prisma } from "@prisma/client"
import { useQueryClient } from "@tanstack/react-query"
import { rgbaToHex, rgbaToHsva, Sketch, type RgbaColor } from "@uiw/react-color"
import { differenceInMinutes, formatDate, formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { useAtomValue, useSetAtom } from "jotai"
import {
  Check,
  CircleHelp,
  Download,
  ExternalLink,
  Globe,
  Loader,
  Play,
  QrCodeIcon
} from "lucide-react"
import lz from "lzutf8"
import { AnimatePresence, motion } from "motion/react"
import { useAction } from "next-safe-action/hooks"
import Link from "next/link"

import { TooltipHelper } from "@/components/dashboard/tooltip-helper"
import {
  GuardLink,
  useSetUnsavedChanges
} from "@/components/dashboard/unsaved-changes-provider"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  updateMenuSerialData,
  updateMenuStatus
} from "@/server/actions/menu/mutations"
import type { getMenuById } from "@/server/actions/menu/queries"
import useLocalStorage from "@/hooks/use-local-storage"
import { colorThemeAtom, fontThemeAtom, tourModeAtom } from "@/lib/atoms"
import exportAsImage from "@/lib/export-as-image"
import { MenuStatus } from "@/lib/types"
import { getBaseUrl } from "@/lib/utils"

export default function MenuPublish({
  menu
}: {
  menu: Prisma.PromiseReturnType<typeof getMenuById>
}) {
  const { store, query, actions, nodes } = useEditor((state, query) => ({
    nodes: query.getSerializedNodes()
  }))

  const queryClient = useQueryClient()
  const fontTheme = useAtomValue(fontThemeAtom)
  const colorTheme = useAtomValue(colorThemeAtom)
  const setMenuTour = useSetAtom(tourModeAtom)

  const { execute, status, reset } = useAction(updateMenuStatus, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Menú actualizado")
        queryClient.invalidateQueries({
          queryKey: ["menu", menu?.id]
        })
        // Reset history to avoid undoing the update
        actions.history.clear()
      } else if (data?.failure.reason) {
        toast.error(data.failure.reason)
      }
      reset()
    },
    onError: () => {
      toast.error("Ocurrió un error al actualizar el menú")
      reset()
    }
  })

  useEffect(() => {
    // console.dir(store.history.timeline)
  }, [store.history.timeline, query, nodes])

  // Verify if the menu theme has changed
  const { clearUnsavedChanges } = useSetUnsavedChanges()
  const {
    execute: updateSerialData,
    status: statusSerialData,
    reset: resetSerialData
  } = useAction(updateMenuSerialData, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        // toast.success("Cambios guardados")
        queryClient.invalidateQueries({
          queryKey: ["menu", menu?.id]
        })
        // Reset history to avoid undoing the update
        // actions.history.clear()

        // Clear unsaved changes
        clearUnsavedChanges()
      } else if (data?.failure.reason) {
        toast.error(data.failure.reason)
      }
      resetSerialData()
    },
    onError: () => {
      toast.error("Ocurrió un error")
      resetSerialData()
    }
  })

  const [lastSavedTimelineLength, setLastSavedTimelineLength] =
    useState<number>(store.history.timeline.length)

  useEffect(() => {
    // Check if the timeline has more changes since the last save
    if (store.history.timeline.length <= lastSavedTimelineLength) return

    const autoSaveTimer = setTimeout(() => {
      handleUpdateSerialData()
      setLastSavedTimelineLength(store.history.timeline.length)
    }, 10000)

    return () => clearTimeout(autoSaveTimer)
  }, [store.history.timeline.length, lastSavedTimelineLength, nodes])

  if (!menu) return null

  const handleUpdateStatus = (status: MenuStatus) => {
    const json = query.serialize()
    const serialData = lz.encodeBase64(lz.compress(json))
    execute({
      id: menu?.id,
      subdomain: menu.organization.subdomain,
      status,
      fontTheme,
      colorTheme,
      serialData
    })
  }

  const handleUpdateSerialData = () => {
    const json = query.serialize()
    const serialData = lz.encodeBase64(lz.compress(json))
    updateSerialData({
      id: menu?.id,
      fontTheme,
      colorTheme,
      serialData
    })
  }

  return (
    <div className="editor-published flex justify-end gap-4 sm:gap-2">
      <TooltipHelper content="Vista previa">
        <div>
          <GuardLink href={`/menu-editor/${menu.id}/preview`}>
            <Button size="xs" variant="ghost">
              <Play className="size-4" />
            </Button>
          </GuardLink>
        </div>
      </TooltipHelper>
      <TooltipHelper content="Guardar cambios">
        <Button
          size="xs"
          variant="ghost"
          disabled={statusSerialData === "executing"}
          onClick={() => handleUpdateSerialData()}
        >
          {statusSerialData === "executing" ? (
            <Loader className="size-4 animate-spin" />
          ) : (
            <Check className="size-4" />
          )}
        </Button>
      </TooltipHelper>
      <Dialog>
        <TooltipHelper content="Generar código QR">
          <DialogTrigger asChild>
            <Button size="xs" variant="ghost">
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
                className="text-blue-600 hover:text-blue-800"
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
          {menu.status === MenuStatus.DRAFT && (
            <Alert variant="warning">
              <AlertDescription className="flex flex-row items-center gap-3">
                No olvides publicar tu menú para que sea accesible a través del
                código QR.
              </AlertDescription>
            </Alert>
          )}
        </DialogContent>
      </Dialog>
      <Separator
        orientation="vertical"
        className="mr-2 h-100 border-l dark:border-gray-700"
      />
      <Popover>
        <div className="relative">
          <PopoverTrigger asChild>
            <Button size="xs">Publicar</Button>
          </PopoverTrigger>
          {menu.publishedAt &&
            differenceInMinutes(menu.updatedAt, menu.publishedAt) >= 1 && (
              <>
                <span className="absolute -top-1 -right-1 h-3 w-3 animate-[ping_1s_ease-in-out_5] rounded-full bg-rose-400"></span>
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-rose-500"></span>
              </>
            )}
        </div>
        <PopoverContent className="w-80">
          <AnimatePresence initial={false} mode="wait">
            {menu.status === MenuStatus.DRAFT ? (
              <motion.div
                key={menu.status}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex flex-col items-center gap-2"
              >
                <span className="rounded-full bg-indigo-50 p-2 text-indigo-700 ring-1 ring-indigo-600/20 ring-inset dark:bg-indigo-900/70 dark:text-indigo-500">
                  <Globe className="size-6" />
                </span>
                <span className="text-sm font-medium">Publicar Menú</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Publica tu menú a una URL pública que puedes compartir.
                </span>
                <Button
                  size="xs"
                  className="mt-2 w-full"
                  onClick={() => handleUpdateStatus(MenuStatus.PUBLISHED)}
                >
                  {status === "executing" ? (
                    <Loader className="size-4 animate-spin" />
                  ) : (
                    "Publicar"
                  )}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key={menu.status}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex flex-col gap-2"
              >
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
                <div className="space-y-2">
                  <AnimatePresence>
                    {menu.publishedAt &&
                      differenceInMinutes(menu.updatedAt, menu.publishedAt) >=
                        1 && (
                        <motion.p
                          initial={{ height: 0, opacity: 0 }}
                          animate={{
                            height: "auto",
                            opacity: 1,
                            transition: {
                              height: {
                                duration: 0.2
                              },
                              opacity: {
                                duration: 0.1,
                                delay: 0.05
                              }
                            }
                          }}
                          exit={{
                            height: 0,
                            opacity: 0,
                            transition: {
                              height: {
                                duration: 0.2
                              },
                              opacity: {
                                duration: 0.1
                              }
                            }
                          }}
                          className="my-3 text-xs text-gray-500 dark:text-gray-400"
                        >
                          Existen cambios sin publicar. <br /> Publica los
                          cambios para actualizar tu menú.
                        </motion.p>
                      )}
                  </AnimatePresence>
                  <Button
                    size="xs"
                    className="mt-2 w-full"
                    onClick={() =>
                      handleUpdateStatus(menu.status as MenuStatus)
                    }
                  >
                    {status === "executing" ? (
                      <Loader className="size-4 animate-spin" />
                    ) : (
                      "Publicar cambios"
                    )}
                  </Button>
                  <Button
                    size="xs"
                    className="w-full"
                    variant="outline"
                    onClick={() => handleUpdateStatus(MenuStatus.DRAFT)}
                  >
                    Cambiar a borrador
                  </Button>

                  <TooltipHelper
                    content={
                      menu.publishedAt
                        ? formatDate(menu.publishedAt, "PPpp", {
                            locale: es
                          })
                        : ""
                    }
                  >
                    <p className="pt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                      Publicado{" "}
                      {menu.publishedAt
                        ? formatDistanceToNow(menu.publishedAt, {
                            addSuffix: true,
                            locale: es
                          })
                        : ""}
                    </p>
                  </TooltipHelper>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </PopoverContent>
      </Popover>
      <TooltipHelper content="Ayuda">
        <Button
          size="xs"
          variant="ghost"
          onClick={() => setMenuTour(true)}
          className="hidden sm:block"
        >
          <CircleHelp className="size-4" />
        </Button>
      </TooltipHelper>
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
  const [logoBase64, setLogoBase64] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!logoURL) return

    setIsLoading(true)
    const img = new Image()
    img.crossOrigin = "Anonymous"
    img.src = `${logoURL}?q=true`
    img.onload = () => {
      const canvas = document.createElement("canvas")
      const aspectRatio = img.width / img.height
      canvas.width = 120 * aspectRatio
      canvas.height = 120
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        setLogoBase64(canvas.toDataURL("image/png"))
      }
      setIsLoading(false)
    }
    img.onerror = () => {
      setIsLoading(false)
    }
  }, [logoURL])

  console.log(logoURL)
  console.log(logoBase64)

  return (
    <div>
      <div className="my-6 flex flex-row items-start justify-between">
        <div className="flex grow items-center justify-center">
          <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-500">
            <div ref={exportRef} className="p-1">
              <QRCode
                value={value}
                size={200}
                ecLevel={showLogo ? "H" : "M"}
                logoImage={showLogo && logoBase64 ? logoBase64 : ""}
                logoWidth={showLogo ? 60 : 0}
                logoPadding={showLogo ? 4 : 0}
                removeQrCodeBehindLogo={showLogo}
                enableCORS
                fgColor={rgbaToHex(color)}
                qrStyle="fluid"
                eyeRadius={[
                  {
                    // top/left eye
                    outer: [10, 10, 10, 10],
                    inner: [3, 3, 3, 3]
                  },
                  {
                    // top/right eye
                    outer: [10, 10, 10, 10],
                    inner: [3, 3, 3, 3]
                  },
                  {
                    // bottom/left eye
                    outer: [10, 10, 10, 10],
                    inner: [3, 3, 3, 3]
                  }
                ]}
              />
            </div>
          </div>
        </div>
        <div className="sm:min-w-40">
          <form className="grid w-full items-start gap-6">
            <fieldset className="grid gap-6 rounded-lg border p-4 dark:border-gray-800">
              <legend className="-ml-1 px-1 text-sm font-medium">
                Ajustes
              </legend>
              <div className="grid gap-3">
                <Label htmlFor="color">Color</Label>
                <Popover>
                  <PopoverTrigger>
                    <div
                      className="h-6 w-12 rounded-sm border border-black/20 dark:border-white/20"
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
                {isLoading ? (
                  <Loader className="size-4 animate-spin" />
                ) : (
                  <Switch
                    checked={showLogo}
                    disabled={!logoBase64}
                    onCheckedChange={checked => {
                      setShowLogo(checked)
                    }}
                  />
                )}
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
