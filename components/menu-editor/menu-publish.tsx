"use client"

import toast from "react-hot-toast"
import { useEditor } from "@craftjs/core"
import type { Menu } from "@prisma/client"
import { useQueryClient } from "@tanstack/react-query"
import { Copy, Globe, Loader } from "lucide-react"
import lz from "lzutf8"
import { useAction } from "next-safe-action/hooks"

import { TooltipHelper } from "@/components/dashboard/tooltip-helper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { updateMenuStatus } from "@/server/actions/menu/mutations"
import { MenuStatus } from "@/lib/types"

export default function MenuPublish({ menu }: { menu: Menu }) {
  const { query } = useEditor()
  const queryClient = useQueryClient()

  const { execute, status, reset } = useAction(updateMenuStatus, {
    onSuccess: data => {
      if (data.success) {
        toast.success("Menú actualizado")
        queryClient.invalidateQueries({
          queryKey: ["menu", menu.id]
        })
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

  const handleSave = (status: MenuStatus) => {
    const json = query.serialize()
    const serialData = lz.encodeBase64(lz.compress(json))
    execute({ id: menu.id, status, serialData })
  }

  return (
    <div className="flex justify-end gap-1">
      {/* {menu.status === MenuStatus.DRAFT ? (
        <Button
          size="xs"
          className="min-w-20"
          onClick={() => handleSave(MenuStatus.PUBLISHED)}
        >
          {status === "executing" ? (
            <Loader className="size-4 animate-spin" />
          ) : (
            "Publicar"
          )}
        </Button>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="xs">Publicado</Button>
          </DropdownMenuTrigger>
        </DropdownMenu>
      )} */}
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
                <Input
                  type="text"
                  placeholder="https://example.com/menu"
                  className="h-8 w-full"
                  readOnly
                  value={`https://biztro.co/${menu.id}`}
                />
                <TooltipHelper content="Copiar">
                  <Button size="icon" variant="outline" className="size-8">
                    <Copy className="size-3.5" />
                  </Button>
                </TooltipHelper>
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
