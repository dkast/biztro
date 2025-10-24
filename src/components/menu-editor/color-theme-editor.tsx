import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Prisma } from "@prisma/client"
import {
  Colorful,
  hexToHsva,
  Sketch,
  type SwatchPresetColor
} from "@uiw/react-color"
import { extractColors } from "extract-colors/lib/worker-wrapper"
import {
  Contrast,
  FilePlus,
  Loader,
  Save,
  Trash2,
  WandSparkles
} from "lucide-react"
import { nanoid } from "nanoid"
// import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { useAction } from "next-safe-action/hooks"
import * as z from "zod/v4"

import FontWrapper from "@/components/menu-editor/font-wrapper"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerNested,
  DrawerTitle
} from "@/components/ui/drawer"
// legacy Form helpers removed in favor of Field primitives
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
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
import { useIsMobile } from "@/hooks/use-mobile"
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
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [themeState, setThemeState] = useState(theme)
  const [isExtracting, setIsExtracting] = useState(false)
  const isMobile = useIsMobile()
  const [drawerColorKey, setDrawerColorKey] = useState<
    null | keyof typeof themeState
  >(null)

  const {
    execute: createTheme,
    status,
    reset
  } = useAction(createColorTheme, {
    onSuccess: ({ data }) => {
      if (data?.failure?.reason) {
        toast.error(data.failure?.reason)
        return
      }
      if (data?.success) {
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
    onSuccess: ({ data }) => {
      if (data?.failure?.reason) {
        toast.error(data.failure?.reason)
        return
      }

      if (data?.success) {
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
    onSuccess: ({ data }) => {
      if (data?.failure?.reason) {
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

  const handleCreateTheme = (name: string) => {
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
      setIsDialogOpen(true)
      return
    }
    updateTheme({
      id: themeState.id,
      name: themeState.name,
      themeJSON: JSON.stringify(themeState)
    })
  }

  const handleDialogSubmit = (name: string) => {
    handleCreateTheme(name)
  }

  const extractColorsFromImage = async () => {
    if (!menu?.organization.logo) {
      toast.error("No hay logo para extraer colores")
      return
    }
    try {
      setIsExtracting(true)
      let colors
      try {
        colors = await extractColors(menu.organization.logo, {
          crossOrigin: "anonymous",
          requestMode: "cors"
        })
      } catch {
        setIsExtracting(false)
        toast.error("Error al extraer colores")
        return
      }

      // Sort colors by area
      colors.sort((a, b) => b.area - a.area)
      // console.log(colors)

      setThemeState(prev => ({
        ...prev,
        surfaceColor: colors[0]?.hex || prev.surfaceColor,
        brandColor: colors[1]?.hex || prev.brandColor,
        accentColor: colors[2]?.hex || prev.accentColor,
        textColor: colors[3]?.hex || prev.textColor,
        mutedColor: colors[4]?.hex || prev.mutedColor
      }))

      // Update colorPresets when colors are extracted
      setColorPresets([
        {
          color: colors[0]?.hex || themeState.surfaceColor,
          title: "Fondo"
        },
        {
          color: colors[1]?.hex || themeState.brandColor,
          title: "Marca"
        },
        {
          color: colors[2]?.hex || themeState.accentColor,
          title: "Acento"
        },
        { color: colors[3]?.hex || themeState.textColor, title: "Texto" },
        { color: colors[4]?.hex || themeState.mutedColor, title: "Tenue" }
      ])
    } catch {
      toast.error("Error al extraer colores")
    } finally {
      setIsExtracting(false)
    }
  }

  const invertColors = () => {
    setThemeState(prev => ({
      ...prev,
      surfaceColor: prev.textColor,
      brandColor: prev.accentColor,
      accentColor: prev.brandColor,
      textColor: prev.surfaceColor,
      mutedColor: prev.mutedColor
    }))
  }

  const [colorPresets, setColorPresets] = useState<SwatchPresetColor[]>([
    { color: themeState.brandColor, title: "Marca" },
    { color: themeState.accentColor, title: "Acento" },
    { color: themeState.surfaceColor, title: "Fondo" },
    { color: themeState.textColor, title: "Texto" },
    { color: themeState.mutedColor, title: "Tenue" }
  ])

  return (
    <>
      <ThemeNameDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleDialogSubmit}
      />
      {/* Drawer for mobile color picker */}
      {isMobile && drawerColorKey && (
        <DrawerNested
          open={!!drawerColorKey}
          onOpenChange={open => (open ? null : setDrawerColorKey(null))}
        >
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>
                {drawerColorKey === "surfaceColor" && "Color de Fondo"}
                {drawerColorKey === "brandColor" && "Color de Marca"}
                {drawerColorKey === "accentColor" && "Color de Acento"}
                {drawerColorKey === "textColor" && "Color de Texto"}
                {drawerColorKey === "mutedColor" && "Color Tenue"}
              </DrawerTitle>
              <DrawerDescription>Selecciona un color.</DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-4">
              <div
                className="mb-4 flex items-center justify-center"
                onPointerDown={e => e.stopPropagation()}
                onTouchStart={e => e.stopPropagation()}
                onMouseDown={e => e.stopPropagation()}
              >
                <Colorful
                  disableAlpha
                  color={
                    themeState[
                      drawerColorKey as keyof typeof themeState
                    ] as string
                  }
                  onChange={color => {
                    setThemeState(prev => ({
                      ...prev,
                      [drawerColorKey]: color.hex
                    }))
                  }}
                />
              </div>
              <div className="mt-6 flex">
                <Button
                  className="w-full"
                  onClick={() => setDrawerColorKey(null)}
                >
                  Listo
                </Button>
              </div>
            </div>
          </DrawerContent>
        </DrawerNested>
      )}
      <div className="flex flex-col gap-6 py-4">
        <ThemePreview
          menu={menu}
          fontDisplay={fontDisplay}
          fontText={fontText}
          theme={themeState}
        />
        <fieldset className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <legend className="-ml-1 px-1 text-sm font-medium">Colores</legend>
          <div className="grid grid-cols-4 items-center gap-2">
            <dt>
              <Label size="xs">Fondo</Label>
            </dt>
            <dd className="flex items-center">
              {isMobile ? (
                <button
                  type="button"
                  className="h-5 w-12 rounded-sm border border-black/20 dark:border-white/20"
                  style={{ backgroundColor: themeState.surfaceColor }}
                  aria-label="Seleccionar color de fondo"
                  onClick={() => setDrawerColorKey("surfaceColor")}
                />
              ) : (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="h-5 w-12 rounded-sm border border-black/20 dark:border-white/20"
                      style={{ backgroundColor: themeState.surfaceColor }}
                      aria-label="Seleccionar color de fondo"
                    />
                  </PopoverTrigger>
                  <PopoverContent className="w-[218px] border-0 p-0 shadow-none">
                    <Sketch
                      disableAlpha
                      presetColors={colorPresets}
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
              )}
            </dd>
            <dt>
              <Label size="xs">Marca</Label>
            </dt>
            <dd className="flex items-center">
              {isMobile ? (
                <button
                  type="button"
                  className="h-5 w-12 rounded-sm border border-black/20 dark:border-white/20"
                  style={{ backgroundColor: themeState.brandColor }}
                  aria-label="Seleccionar color de marca"
                  onClick={() => setDrawerColorKey("brandColor")}
                />
              ) : (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="h-5 w-12 rounded-sm border border-black/20 dark:border-white/20"
                      style={{ backgroundColor: themeState.brandColor }}
                      aria-label="Seleccionar color de marca"
                    />
                  </PopoverTrigger>
                  <PopoverContent className="w-[218px] border-0 p-0 shadow-none">
                    <Sketch
                      disableAlpha
                      presetColors={colorPresets}
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
              )}
            </dd>
            <dt>
              <Label size="xs">Acento</Label>
            </dt>
            <dd className="flex items-center">
              {isMobile ? (
                <button
                  type="button"
                  className="h-5 w-12 rounded-sm border border-black/20 dark:border-white/20"
                  style={{ backgroundColor: themeState.accentColor }}
                  aria-label="Seleccionar color de acento"
                  onClick={() => setDrawerColorKey("accentColor")}
                />
              ) : (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="h-5 w-12 rounded-sm border border-black/20 dark:border-white/20"
                      style={{ backgroundColor: themeState.accentColor }}
                      aria-label="Seleccionar color de acento"
                    />
                  </PopoverTrigger>
                  <PopoverContent className="w-[218px] border-0 p-0 shadow-none">
                    <Sketch
                      disableAlpha
                      presetColors={colorPresets}
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
              )}
            </dd>
            <dt>
              <Label size="xs">Texto</Label>
            </dt>
            <dd className="flex items-center">
              {isMobile ? (
                <button
                  type="button"
                  className="h-5 w-12 rounded-sm border border-black/20 dark:border-white/20"
                  style={{ backgroundColor: themeState.textColor }}
                  aria-label="Seleccionar color de texto"
                  onClick={() => setDrawerColorKey("textColor")}
                />
              ) : (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="h-5 w-12 rounded-sm border border-black/20 dark:border-white/20"
                      style={{ backgroundColor: themeState.textColor }}
                      aria-label="Seleccionar color de texto"
                    />
                  </PopoverTrigger>
                  <PopoverContent className="w-[218px] border-0 p-0 shadow-none">
                    <Sketch
                      disableAlpha
                      presetColors={colorPresets}
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
              )}
            </dd>
            <dt>
              <Label size="xs">Tenue</Label>
            </dt>
            <dd className="flex items-center">
              {isMobile ? (
                <button
                  type="button"
                  className="h-5 w-12 rounded-sm border border-black/20 dark:border-white/20"
                  style={{ backgroundColor: themeState.mutedColor }}
                  aria-label="Seleccionar color tenue"
                  onClick={() => setDrawerColorKey("mutedColor")}
                />
              ) : (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="h-5 w-12 rounded-sm border border-black/20 dark:border-white/20"
                      style={{ backgroundColor: themeState.mutedColor }}
                      aria-label="Seleccionar color tenue"
                    />
                  </PopoverTrigger>
                  <PopoverContent className="w-[218px] border-0 p-0 shadow-none">
                    <Sketch
                      disableAlpha
                      presetColors={colorPresets}
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
              )}
            </dd>
          </div>
        </fieldset>
        <div className="flex flex-col gap-y-3 pb-12 sm:gap-y-1">
          <Button
            variant="outline"
            size={isMobile ? "default" : "sm"}
            onClick={extractColorsFromImage}
            disabled={isExtracting}
          >
            {isExtracting ? (
              <Loader className="mr-2 size-4 animate-spin" />
            ) : (
              <WandSparkles className="mr-2 size-4" />
            )}
            Extraer colores
          </Button>
          <Button
            variant="outline"
            size={isMobile ? "default" : "sm"}
            onClick={invertColors}
          >
            <Contrast className="mr-2 size-4" />
            Invertir colores
          </Button>

          <ButtonGroup className="w-full">
            <Button
              variant="outline"
              size={isMobile ? "default" : "sm"}
              className="flex-1"
              disabled={
                status === "executing" ||
                updateStatus === "executing" ||
                deleteStatus === "executing"
              }
              onClick={() => setIsDialogOpen(true)}
            >
              <FilePlus className="mr-2 size-4" />
              Nuevo
            </Button>
            <Button
              variant="outline"
              size={isMobile ? "default" : "sm"}
              className="flex-1"
              disabled={
                status === "executing" ||
                updateStatus === "executing" ||
                deleteStatus === "executing" ||
                themeState.scope === "GLOBAL"
              }
              onClick={handleUpdateTheme}
            >
              {status === "executing" || updateStatus === "executing" ? (
                <Loader className="mr-2 size-4 animate-spin" />
              ) : (
                <Save className="mr-2 size-4" />
              )}
              Guardar
            </Button>
            <Button
              variant="outline"
              size={isMobile ? "default" : "sm"}
              className="flex-1"
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
              ) : (
                <Trash2 className="mr-2 size-4" />
              )}
              Eliminar
            </Button>
          </ButtonGroup>
        </div>
      </div>
    </>
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
          <Avatar className="h-16 w-16 rounded-xl shadow-sm">
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

const schema = z.object({
  name: z
    .string()
    .min(1, "Nombre es requerido")
    .max(50)
    .regex(
      /^[a-zA-Z0-9 ]*$/,
      "Nombre solo puede contener letras, números y espacios"
    )
})

type ThemeNameDialogProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (name: string) => void
}

export function ThemeNameDialog({
  isOpen,
  onClose,
  onSubmit
}: ThemeNameDialogProps) {
  const isMobile = useIsMobile()
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema)
  })

  const handleFormSubmit = (data: { name: string }) => {
    onSubmit(data.name)
    onClose()
  }

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Nombre del Tema</DrawerTitle>
            <DrawerDescription>
              Por favor, ingresa un nombre para el tema.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4">
            <form onSubmit={form.handleSubmit(handleFormSubmit)}>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Nombre Tema</FieldLabel>
                    <Input {...field} placeholder="Nombre Tema" />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <div className="mt-6 flex">
                <Button type="submit" className="w-full">
                  Guardar
                </Button>
              </div>
            </form>
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nombre del Tema</DialogTitle>
          <DialogDescription>
            Por favor, ingresa un nombre para el tema.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Nombre Tema</FieldLabel>
                <Input {...field} placeholder="Nombre Tema" />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <div className="mt-6 flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="secondary" type="button">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
