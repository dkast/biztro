import { useState } from "react"
import toast from "react-hot-toast"
import type { Prisma } from "@prisma/client"
import { hexToHsva, Sketch } from "@uiw/react-color"
import { Loader } from "lucide-react"
import { nanoid } from "nanoid"
// import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { useAction } from "next-safe-action/hooks"

import FontWrapper from "@/components/menu-editor/font-wrapper"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import {
  createColorTheme,
  deleteColorTheme,
  updateColorTheme
} from "@/server/actions/menu/mutations"
import type { getMenuById } from "@/server/actions/menu/queries"
import { ThemeScope, type colorThemes } from "@/lib/types"

export function ColorThemeEditor({
  menu,
  fontDisplay,
  fontText,
  theme,
  setTheme,
  removeTheme
}: {
  menu: Prisma.PromiseReturnType<typeof getMenuById>
  fontDisplay?: string
  fontText?: string
  theme: (typeof colorThemes)[0]
  setTheme: (theme: (typeof colorThemes)[0]) => void
  removeTheme: (themeId: string) => void
}) {
  const [themeState, setThemeState] = useState(theme)
  const {
    execute: createTheme,
    status,
    reset
  } = useAction(createColorTheme, {
    onSuccess: data => {
      if (data.failure?.reason) {
        toast.error(data.failure?.reason)
        return
      }
      if (data.success) {
        setTheme(JSON.parse(data.success.themeJSON))
        toast.success("Tema guardado")
      }
      reset()
    },
    onError: () => {
      toast.error("Algo salió mal al guardar el tema")
      reset()
    }
  })

  const {
    execute: updateTheme,
    status: updateStatus,
    reset: resetStatus
  } = useAction(updateColorTheme, {
    onSuccess: data => {
      if (data.failure?.reason) {
        toast.error(data.failure?.reason)
        return
      }

      if (data.success) {
        setTheme(JSON.parse(data.success.themeJSON))
        toast.success("Tema guardado")
      }
      resetStatus()
    },
    onError: () => {
      toast.error("Algo salió mal al guardar el tema")
      resetStatus()
    }
  })

  const {
    execute: deleteTheme,
    status: deleteStatus,
    reset: resetDeleteStatus
  } = useAction(deleteColorTheme, {
    onSuccess: data => {
      if (data.failure?.reason) {
        toast.error(data.failure?.reason)
        return
      }
      removeTheme(themeState.id)
      toast.success("Tema eliminado")
      resetDeleteStatus()
    },
    onError: () => {
      toast.error("Algo salió mal al eliminar el tema")
      resetDeleteStatus()
    }
  })

  const handleCreateTheme = () => {
    const name = "Personalizado"
    const id = nanoid(10)
    const scope = ThemeScope.USER
    setThemeState(prev => ({ ...prev, id, name, scope }))
    createTheme({
      id,
      name,
      scope,
      themeType: "COLOR",
      themeJSON: JSON.stringify(
        // replace id in themeState
        { ...themeState, id, name, scope }
      ),
      organizationId: menu?.organizationId
    })
  }

  const handleUpdateTheme = () => {
    if (themeState.scope === "GLOBAL") {
      handleCreateTheme()
      return
    }
    updateTheme({
      id: themeState.id,
      name: themeState.name,
      themeJSON: JSON.stringify(themeState)
    })
  }

  return (
    <div className="flex flex-col gap-6 py-4">
      <ThemePreview
        menu={menu}
        fontDisplay={fontDisplay}
        fontText={fontText}
        theme={themeState}
      />
      <fieldset className="rounded-lg border p-4 dark:border-gray-700">
        <legend className="-ml-1 px-1 text-sm font-medium">Colores</legend>
        <div className="grid grid-cols-4 items-center gap-2">
          <dt>
            <Label size="sm">Fondo</Label>
          </dt>
          <dd className="flex items-center">
            <Popover>
              <PopoverTrigger>
                <div
                  className="h-5 w-12 rounded border border-black/20 dark:border-white/20"
                  style={{
                    backgroundColor: themeState.surfaceColor
                  }}
                ></div>
              </PopoverTrigger>
              <PopoverContent className="w-[218px] border-0 p-0 shadow-none">
                <Sketch
                  disableAlpha
                  color={hexToHsva(themeState.surfaceColor)}
                  onChange={color => {
                    setThemeState(prev => ({
                      ...prev,
                      surfaceColor: color.hex
                    }))
                  }}
                />
              </PopoverContent>
            </Popover>
          </dd>
          <dt>
            <Label size="sm">Marca</Label>
          </dt>
          <dd className="flex items-center">
            <Popover>
              <PopoverTrigger>
                <div
                  className="h-5 w-12 rounded border border-black/20 dark:border-white/20"
                  style={{
                    backgroundColor: themeState.brandColor
                  }}
                ></div>
              </PopoverTrigger>
              <PopoverContent className="w-[218px] border-0 p-0 shadow-none">
                <Sketch
                  disableAlpha
                  color={hexToHsva(themeState.brandColor)}
                  onChange={color => {
                    setThemeState(prev => ({
                      ...prev,
                      brandColor: color.hex
                    }))
                  }}
                />
              </PopoverContent>
            </Popover>
          </dd>
          <dt>
            <Label size="sm">Acento</Label>
          </dt>
          <dd className="flex items-center">
            <Popover>
              <PopoverTrigger>
                <div
                  className="h-5 w-12 rounded border border-black/20 dark:border-white/20"
                  style={{
                    backgroundColor: themeState.accentColor
                  }}
                ></div>
              </PopoverTrigger>
              <PopoverContent className="w-[218px] border-0 p-0 shadow-none">
                <Sketch
                  disableAlpha
                  color={hexToHsva(themeState.accentColor)}
                  onChange={color => {
                    setThemeState(prev => ({
                      ...prev,
                      accentColor: color.hex
                    }))
                  }}
                />
              </PopoverContent>
            </Popover>
          </dd>
          <dt>
            <Label size="sm">Texto</Label>
          </dt>
          <dd className="flex items-center">
            <Popover>
              <PopoverTrigger>
                <div
                  className="h-5 w-12 rounded border border-black/20 dark:border-white/20"
                  style={{
                    backgroundColor: themeState.textColor
                  }}
                ></div>
              </PopoverTrigger>
              <PopoverContent className="w-[218px] border-0 p-0 shadow-none">
                <Sketch
                  disableAlpha
                  color={hexToHsva(themeState.textColor)}
                  onChange={color => {
                    setThemeState(prev => ({
                      ...prev,
                      textColor: color.hex
                    }))
                  }}
                />
              </PopoverContent>
            </Popover>
          </dd>
          <dt>
            <Label size="sm">Tenue</Label>
          </dt>
          <dd className="flex items-center">
            <Popover>
              <PopoverTrigger>
                <div
                  className="h-5 w-12 rounded border border-black/20 dark:border-white/20"
                  style={{
                    backgroundColor: themeState.mutedColor
                  }}
                ></div>
              </PopoverTrigger>
              <PopoverContent className="w-[218px] border-0 p-0 shadow-none">
                <Sketch
                  disableAlpha
                  color={hexToHsva(themeState.mutedColor)}
                  onChange={color => {
                    setThemeState(prev => ({
                      ...prev,
                      mutedColor: color.hex
                    }))
                  }}
                />
              </PopoverContent>
            </Popover>
          </dd>
        </div>
      </fieldset>
      <div className="grid grid-cols-2 gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={
            status === "executing" ||
            updateStatus === "executing" ||
            deleteStatus === "executing"
          }
          onClick={handleUpdateTheme}
        >
          {status === "executing" || updateStatus === "executing" ? (
            <Loader className="mr-2 size-4 animate-spin" />
          ) : null}
          Guardar
        </Button>
        {/* <Button
          variant="outline"
          size="sm"
          disabled={
            status === "executing" ||
            updateStatus === "executing" ||
            deleteStatus === "executing"
          }
          onClick={handleCreateTheme}
        >
          Duplicar
        </Button> */}
        <Button
          variant="destructive"
          size="sm"
          disabled={
            status === "executing" ||
            updateStatus === "executing" ||
            deleteStatus === "executing" ||
            themeState.scope === "GLOBAL"
          }
          onClick={() => {
            deleteTheme({ id: themeState.id })
          }}
        >
          {deleteStatus === "executing" ? (
            <Loader className="mr-2 size-4 animate-spin" />
          ) : null}
          Eliminar
        </Button>
        {/* <Button
          variant="secondary"
          size="sm"
          className="mt-2 w-full"
          onClick={() => {
            navigator.clipboard.writeText(JSON.stringify(themeState))
            toast.success("Tema copiado al portapapeles")
          }}
        >
          Copiar JSON
        </Button> */}
      </div>
    </div>
  )
}

function ThemePreview({
  menu,
  fontDisplay,
  fontText,
  theme
}: {
  menu: Prisma.PromiseReturnType<typeof getMenuById>
  fontDisplay?: string
  fontText?: string
  theme: (typeof colorThemes)[0]
}) {
  return (
    <div
      className="flex flex-col gap-4 rounded-lg border-2 border-black/10 p-4 dark:border-white/20"
      style={{
        backgroundColor: theme.surfaceColor,
        color: theme.brandColor
      }}
    >
      <div className="flex flex-row items-center gap-4">
        {/* {menu?.organization?.logo && (
          <Avatar className="h-16 w-16 rounded-xl shadow">
            <AvatarImage
              src={menu?.organization?.logo}
              className="rounded-xl"
            />
          </Avatar>
        )} */}
        <FontWrapper fontFamily={fontDisplay}>
          <h1 className="text-xl font-semibold">
            {menu?.organization?.name || "Negocio"}
          </h1>
        </FontWrapper>
      </div>
      <div className="space-y-2">
        <FontWrapper fontFamily={fontDisplay}>
          <h3
            className="text-lg font-semibold"
            style={{
              color: theme.accentColor
            }}
          >
            Categoría
          </h3>
        </FontWrapper>
        <div className="flex flex-row justify-between gap-2">
          <div className="flex flex-col gap-1">
            <FontWrapper fontFamily={fontDisplay}>
              <span
                style={{
                  color: theme.textColor
                }}
              >
                Producto
              </span>
            </FontWrapper>
            <FontWrapper fontFamily={fontText}>
              <span
                className="text-sm"
                style={{
                  color: theme.mutedColor
                }}
              >
                Descripción del producto...
              </span>
            </FontWrapper>
          </div>
          <FontWrapper fontFamily={fontText}>
            <span
              style={{
                color: theme.brandColor
              }}
            >
              99.00
            </span>
          </FontWrapper>
        </div>
      </div>
    </div>
  )
}
