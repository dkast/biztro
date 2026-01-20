"use client"

import * as React from "react"
import { useDirection } from "@radix-ui/react-direction"
import { SearchIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Separator } from "@/components/ui/separator"

const SHORTCUT_KEY = "/"

interface ShortcutGroup {
  title: string
  shortcuts: Array<{
    keys: string[]
    description: string
  }>
}

interface DataGridKeyboardShortcutsProps {
  enableSearch?: boolean
  enableUndoRedo?: boolean
  enablePaste?: boolean
  enableRowAdd?: boolean
  enableRowsDelete?: boolean
}

export const DataGridKeyboardShortcuts = React.memo(
  DataGridKeyboardShortcutsImpl,
  (prev, next) => {
    return (
      prev.enableSearch === next.enableSearch &&
      prev.enableUndoRedo === next.enableUndoRedo &&
      prev.enablePaste === next.enablePaste &&
      prev.enableRowAdd === next.enableRowAdd &&
      prev.enableRowsDelete === next.enableRowsDelete
    )
  }
)

function DataGridKeyboardShortcutsImpl({
  enableSearch = false,
  enableUndoRedo = false,
  enablePaste = false,
  enableRowAdd = false,
  enableRowsDelete = false
}: DataGridKeyboardShortcutsProps) {
  const dir = useDirection()
  const [open, setOpen] = React.useState(false)
  const [input, setInput] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  const isMac =
    typeof navigator !== "undefined"
      ? /Mac|iPhone|iPad|iPod/.test(navigator.userAgent)
      : false

  const modKey = isMac ? "⌘" : "Ctrl"

  const onOpenChange = React.useCallback((isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setInput("")
    }
  }, [])

  const onOpenAutoFocus = React.useCallback((event: Event) => {
    event.preventDefault()
    inputRef.current?.focus()
  }, [])

  const onInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setInput(event.target.value)
    },
    []
  )

  const shortcutGroups: ShortcutGroup[] = React.useMemo(
    () => [
      {
        title: "Navegación",
        shortcuts: [
          {
            keys: ["↑", "↓", "←", "→"],
            description: "Navegar entre celdas"
          },
          {
            keys: ["Tab"],
            description: "Ir a la siguiente celda"
          },
          {
            keys: ["Shift", "Tab"],
            description: "Ir a la celda anterior"
          },
          {
            keys: ["Home"],
            description: "Ir a la primera columna"
          },
          {
            keys: ["End"],
            description: "Ir a la última columna"
          },
          {
            keys: [modKey, "↑"],
            description: "Ir a la primera fila (misma columna)"
          },
          {
            keys: [modKey, "↓"],
            description: "Ir a la última fila (misma columna)"
          },
          {
            keys: [modKey, "←"],
            description: "Ir a la primera columna (misma fila)"
          },
          {
            keys: [modKey, "→"],
            description: "Ir a la última columna (misma fila)"
          },
          {
            keys: [modKey, "Home"],
            description: "Ir a la primera celda"
          },
          {
            keys: [modKey, "End"],
            description: "Ir a la última celda"
          },
          {
            keys: ["PgUp"],
            description: "Subir una página"
          },
          {
            keys: ["PgDn"],
            description: "Bajar una página"
          },
          {
            keys: ["⌥", "↑"],
            description: "Desplazar hacia arriba una página"
          },
          {
            keys: ["⌥", "↓"],
            description: "Desplazar hacia abajo una página"
          },
          {
            keys: ["⌥", "PgUp"],
            description: "Desplazar columnas hacia la izquierda una página"
          },
          {
            keys: ["⌥", "PgDn"],
            description: "Desplazar columnas hacia la derecha una página"
          }
        ]
      },
      {
        title: "Selección",
        shortcuts: [
          {
            keys: ["Shift", "↑↓←→"],
            description: "Extender selección"
          },
          {
            keys: [modKey, "Shift", "↑"],
            description: "Seleccionar hasta la parte superior"
          },
          {
            keys: [modKey, "Shift", "↓"],
            description: "Seleccionar hasta la parte inferior"
          },
          {
            keys: [modKey, "Shift", "←"],
            description: "Seleccionar hasta la primera columna"
          },
          {
            keys: [modKey, "Shift", "→"],
            description: "Seleccionar hasta la última columna"
          },
          {
            keys: [modKey, "A"],
            description: "Seleccionar todas las celdas"
          },
          {
            keys: [modKey, "Click"],
            description: "Alternar selección de celda"
          },
          {
            keys: ["Shift", "Click"],
            description: "Seleccionar rango"
          },
          {
            keys: ["Esc"],
            description: "Borrar selección"
          }
        ]
      },
      {
        title: "Edición",
        shortcuts: [
          {
            keys: ["Enter"],
            description: "Comenzar edición de celda"
          },
          {
            keys: ["F2"],
            description: "Comenzar edición de celda"
          },
          {
            keys: ["Double Click"],
            description: "Comenzar edición de celda"
          },
          ...(enableRowAdd
            ? [
                {
                  keys: ["Shift", "Enter"],
                  description: "Insertar fila abajo"
                }
              ]
            : []),
          {
            keys: [modKey, "C"],
            description: "Copiar celdas seleccionadas"
          },
          {
            keys: [modKey, "X"],
            description: "Cortar celdas seleccionadas"
          },
          ...(enablePaste
            ? [
                {
                  keys: [modKey, "V"],
                  description: "Pegar celdas"
                }
              ]
            : []),
          {
            keys: ["Delete"],
            description: "Borrar celdas seleccionadas"
          },
          {
            keys: ["Backspace"],
            description: "Borrar celdas seleccionadas"
          },
          ...(enableRowsDelete
            ? [
                {
                  keys: [modKey, "Backspace"],
                  description: "Eliminar filas seleccionadas"
                },
                {
                  keys: [modKey, "Delete"],
                  description: "Eliminar filas seleccionadas"
                }
              ]
            : []),
          ...(enableUndoRedo
            ? [
                {
                  keys: [modKey, "Z"],
                  description: "Deshacer la última acción"
                },
                {
                  keys: [modKey, "Shift", "Z"],
                  description: "Rehacer la última acción"
                }
              ]
            : [])
        ]
      },
      ...(enableSearch
        ? [
            {
              title: "Búsqueda",
              shortcuts: [
                {
                  keys: [modKey, "F"],
                  description: "Abrir búsqueda"
                },
                {
                  keys: ["Enter"],
                  description: "Siguiente coincidencia"
                },
                {
                  keys: ["Shift", "Enter"],
                  description: "Coincidencia anterior"
                },
                {
                  keys: ["Esc"],
                  description: "Cerrar búsqueda"
                }
              ]
            }
          ]
        : []),
      {
        title: "Filtrado",
        shortcuts: [
          {
            keys: [modKey, "Shift", "F"],
            description: "Alternar el menú de filtros"
          },
          {
            keys: ["Backspace"],
            description: "Eliminar filtro (cuando está enfocado)"
          },
          {
            keys: ["Delete"],
            description: "Eliminar filtro (cuando está enfocado)"
          }
        ]
      },
      {
        title: "Ordenamiento",
        shortcuts: [
          {
            keys: [modKey, "Shift", "S"],
            description: "Alternar el menú de ordenamiento"
          },
          {
            keys: ["Backspace"],
            description: "Eliminar orden (cuando está enfocado)"
          },
          {
            keys: ["Delete"],
            description: "Eliminar orden (cuando está enfocado)"
          }
        ]
      },
      {
        title: "General",
        shortcuts: [
          {
            keys: [modKey, "/"],
            description: "Mostrar atajos de teclado"
          }
        ]
      }
    ],
    [
      modKey,
      enableSearch,
      enableUndoRedo,
      enablePaste,
      enableRowAdd,
      enableRowsDelete
    ]
  )

  const filteredGroups = React.useMemo(() => {
    if (!input.trim()) return shortcutGroups

    const query = input.toLowerCase()
    return shortcutGroups
      .map(group => ({
        ...group,
        shortcuts: group.shortcuts.filter(
          shortcut =>
            shortcut.description.toLowerCase().includes(query) ||
            shortcut.keys.some(key => key.toLowerCase().includes(query))
        )
      }))
      .filter(group => group.shortcuts.length > 0)
  }, [shortcutGroups, input])

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key === SHORTCUT_KEY) {
        event.preventDefault()
        setOpen(true)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={dir}
        className="max-w-2xl px-0"
        onOpenAutoFocus={onOpenAutoFocus}
        showCloseButton={false}
      >
        <DialogClose className="absolute end-6 top-6" asChild>
          <Button variant="ghost" size="icon" className="size-6">
            <XIcon />
          </Button>
        </DialogClose>
        <DialogHeader className="px-6">
          <DialogTitle>Atajos de teclado</DialogTitle>
          <DialogDescription className="sr-only">
            Usa estos atajos de teclado para navegar e interactuar con la tabla
            de datos de forma más eficiente.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6">
          <div className="relative">
            <SearchIcon
              className="text-muted-foreground absolute start-3 top-1/2 size-3.5
                -translate-y-1/2"
            />
            <Input
              ref={inputRef}
              placeholder="Buscar atajos..."
              className="h-8 ps-8"
              value={input}
              onChange={onInputChange}
            />
          </div>
        </div>
        <Separator
          className="mx-auto
            data-[orientation=horizontal]:w-[calc(100%-(--spacing(12)))]"
        />
        <div className="h-[40vh] overflow-y-auto px-6">
          {filteredGroups.length === 0 ? (
            <div
              className="flex h-full flex-col items-center justify-center gap-3
                text-center"
            >
              <div
                className="bg-muted text-foreground flex size-10 shrink-0
                  items-center justify-center rounded-lg"
              >
                <SearchIcon className="pointer-events-none size-6" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-lg font-medium tracking-tight">
                  No se encontraron atajos
                </div>
                <p className="text-muted-foreground text-sm">
                  Intenta buscar otro término.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {filteredGroups.map(shortcutGroup => (
                <div key={shortcutGroup.title} className="flex flex-col gap-2">
                  <h3 className="text-foreground text-sm font-semibold">
                    {shortcutGroup.title}
                  </h3>
                  <div className="divide-border divide-y rounded-md border">
                    {shortcutGroup.shortcuts.map((shortcut, index) => (
                      <ShortcutCard
                        key={index}
                        keys={shortcut.keys}
                        description={shortcut.description}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ShortcutCard({
  keys,
  description
}: ShortcutGroup["shortcuts"][number]) {
  return (
    <div className="flex items-center gap-4 px-3 py-2">
      <span className="flex-1 text-sm">{description}</span>
      <KbdGroup className="shrink-0">
        {keys.map((key, index) => (
          <React.Fragment key={key}>
            {index > 0 && (
              <span className="text-muted-foreground text-xs">+</span>
            )}
            <Kbd>{key}</Kbd>
          </React.Fragment>
        ))}
      </KbdGroup>
    </div>
  )
}
