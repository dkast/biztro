import { useState } from "react"
import toast from "react-hot-toast"
import type { Prisma } from "@prisma/client"
import { hexToHsva, Sketch } from "@uiw/react-color"

// import { useAction } from "next-safe-action/hooks"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import type { getMenuById } from "@/server/actions/menu/queries"
// import { createColorTheme } from "@/server/actions/menu/mutations"
import { type colorThemes } from "@/lib/types"

export function ColorThemeEditor({
  menu,
  theme,
  setTheme
}: {
  menu: Prisma.PromiseReturnType<typeof getMenuById>
  theme: (typeof colorThemes)[0]
  setTheme: (theme: (typeof colorThemes)[0]) => void
}) {
  const [themeState, setThemeState] = useState(theme)
  // const { execute, status, reset } = useAction(createColorTheme, {
  //   onSuccess: () => {
  //     setTheme(themeState)
  //     alert("Tema creado")
  //     reset()
  //   },
  //   onError: error => {
  //     alert(error)
  //     reset()
  //   }
  // })

  // const handleCreateTheme = (name: string) => {
  //   execute({
  //     name,
  //     scope: "GLOBAL",
  //     themeType: "COLOR",
  //     themeJSON: JSON.stringify(themeState)
  //   })
  // }

  return (
    <div className="flex flex-col gap-6 py-4">
      <ThemePreview menu={menu} theme={themeState} />
      <div className="grid grid-cols-4 items-center gap-2">
        <dt>
          <Label size="sm">Fondo</Label>
        </dt>
        <dd className="flex items-center">
          <Popover>
            <PopoverTrigger>
              <div
                className="h-5 w-12 rounded border border-black/20"
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
                className="h-5 w-12 rounded border border-black/20"
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
                className="h-5 w-12 rounded border border-black/20"
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
                className="h-5 w-12 rounded border border-black/20"
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
                className="h-5 w-12 rounded border border-black/20"
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
      <div>
        <Button
          variant="default"
          size="sm"
          className="w-full"
          onClick={() => {
            setTheme(themeState)
          }}
        >
          Aplicar
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="mt-2 w-full"
          onClick={() => {
            navigator.clipboard.writeText(JSON.stringify(themeState))
            toast.success("Tema copiado al portapapeles")
          }}
        >
          Copiar JSON
        </Button>
      </div>
    </div>
  )
}

function ThemePreview({
  menu,
  theme
}: {
  menu: Prisma.PromiseReturnType<typeof getMenuById>
  theme: (typeof colorThemes)[0]
}) {
  return (
    <div
      className="flex flex-col gap-4 rounded-lg border-2 border-black/10 p-4"
      style={{
        backgroundColor: theme.surfaceColor,
        color: theme.brandColor
      }}
    >
      <h1 className="text-xl font-semibold">
        {menu?.organization?.name || "Negocio"}
      </h1>
      <div className="space-y-2">
        <h3
          className="text-lg font-semibold"
          style={{
            color: theme.accentColor
          }}
        >
          Categoría
        </h3>
        <div className="flex flex-row justify-between gap-2">
          <div className="flex flex-col gap-1">
            <span
              style={{
                color: theme.textColor
              }}
            >
              Producto
            </span>
            <span
              className="text-sm"
              style={{
                color: theme.mutedColor
              }}
            >
              Descripción del producto...
            </span>
          </div>
          <span
            style={{
              color: theme.brandColor
            }}
          >
            0.00
          </span>
        </div>
      </div>
    </div>
  )
}
