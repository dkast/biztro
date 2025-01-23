import { useEffect } from "react"
import { useEditor } from "@craftjs/core"
import { useAtom } from "jotai"
import {
  Clipboard,
  ClipboardPaste,
  Lock,
  LockOpen,
  Monitor,
  Redo2,
  TabletSmartphone,
  Undo2
} from "lucide-react"

import { TooltipHelper } from "@/components/dashboard/tooltip-helper"
import { useSetUnsavedChanges } from "@/components/dashboard/unsaved-changes-provider"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { elementPropsAtom, frameSizeAtom } from "@/lib/atoms"
import { FrameSize } from "@/lib/types"

export default function FloatingBar() {
  const { enabled, canUndo, canRedo, actions, query, selectedNodeId } =
    useEditor((state, query) => ({
      enabled: state.options.enabled,
      canUndo: query.history.canUndo(),
      canRedo: query.history.canRedo(),
      selectedNodeId: state.events.selected
    }))
  const [propsCopy, setPropsCopy] = useAtom(elementPropsAtom)

  const onPasteProps = (clonedProps: unknown) => {
    const values = selectedNodeId.values()
    const nodeId = values.next()
    if (nodeId.value) {
      actions.setProp(nodeId.value, props => {
        return (props = Object.assign(props, clonedProps))
      })
    }
  }

  const onCopyProps = () => {
    const values = selectedNodeId.values()
    const nodeId = values.next()
    if (selectedNodeId && nodeId.value) {
      const node = query.node(nodeId.value).get()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { data, text, ...props } = node.data.props
      setPropsCopy(props)
    }
  }

  const { setUnsavedChanges, clearUnsavedChanges } = useSetUnsavedChanges()

  useEffect(() => {
    // console.log("canUndo", canUndo)
    if (canUndo) {
      setUnsavedChanges({
        message:
          "Tienes cambios sin guardar ¿Estás seguro de salir del Editor?",
        dismissButtonLabel: "Cancelar",
        proceedLinkLabel: "Descartar cambios"
      })
    } else {
      clearUnsavedChanges()
    }
  }, [setUnsavedChanges, clearUnsavedChanges, canUndo])

  const [frameSize, setFrameSize] = useAtom(frameSizeAtom)

  return (
    <div className="editor-toolbar fixed bottom-20 left-1/2 flex h-12 -translate-x-1/2 flex-row items-center justify-between rounded-full bg-gray-800 px-1 text-white shadow-lg dark:border dark:border-gray-700 dark:bg-gray-900 sm:bottom-8 sm:min-w-[200px]">
      <TooltipHelper content="Deshacer">
        <Button
          disabled={!canUndo}
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => actions.history.undo()}
        >
          <Undo2 className="size-4" />
        </Button>
      </TooltipHelper>
      <TooltipHelper content="Rehacer">
        <Button
          disabled={!canRedo}
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => actions.history.redo()}
        >
          <Redo2 className="size-4" />
        </Button>
      </TooltipHelper>
      <Separator
        orientation="vertical"
        className="mx-1 hidden h-6 bg-gray-500 sm:inline-flex"
      />
      <TooltipHelper
        content={
          frameSize === FrameSize.MOBILE
            ? "Cambiar a vista Escritorio"
            : "Cambiar a vista Móvil"
        }
      >
        <Button
          variant="ghost"
          size="icon"
          className="hidden rounded-full sm:inline-flex"
          onClick={() =>
            setFrameSize(
              FrameSize.DESKTOP === frameSize
                ? FrameSize.MOBILE
                : FrameSize.DESKTOP
            )
          }
        >
          {frameSize === FrameSize.MOBILE ? (
            <Monitor className="size-4" />
          ) : (
            <TabletSmartphone className="size-4" />
          )}
        </Button>
      </TooltipHelper>
      <Separator
        orientation="vertical"
        className="mx-1 hidden h-6 bg-gray-500 sm:inline-flex"
      />
      <TooltipHelper content="Copiar estilo">
        <Button
          variant="ghost"
          size="icon"
          className="hidden rounded-full sm:inline-flex"
          onClick={() => onCopyProps()}
        >
          <Clipboard className="size-4" />
        </Button>
      </TooltipHelper>
      <TooltipHelper content="Pegar estilo">
        <Button
          disabled={Object.keys(propsCopy).length === 0}
          variant="ghost"
          size="icon"
          className="hidden rounded-full sm:inline-flex"
          onClick={() => onPasteProps(propsCopy)}
        >
          <ClipboardPaste className="size-4" />
        </Button>
      </TooltipHelper>
      <Separator
        orientation="vertical"
        className="mx-1 hidden h-6 bg-gray-500 sm:inline-flex"
      />
      <TooltipHelper content="Restringir cambios">
        <Button
          variant="ghost"
          size="icon"
          className="hidden rounded-full sm:inline-flex"
          onClick={() =>
            actions.setOptions(options => (options.enabled = !enabled))
          }
        >
          {enabled ? (
            <LockOpen className="size-4" />
          ) : (
            <Lock className="size-4" />
          )}
        </Button>
      </TooltipHelper>
    </div>
  )
}
