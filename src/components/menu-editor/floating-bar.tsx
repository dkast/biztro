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
    actions.setProp(nodeId.value, props => {
      return (props = Object.assign(props, clonedProps))
    })
  }

  const onCopyProps = () => {
    const values = selectedNodeId.values()
    const nodeId = values.next()
    if (selectedNodeId) {
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
    <div className="fixed bottom-8 left-1/2 flex h-12 min-w-[200px] -translate-x-1/2 flex-row items-center justify-between rounded-full bg-gray-800 px-1 text-white shadow-lg dark:border dark:border-gray-800 dark:bg-gray-900">
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
      <Separator orientation="vertical" className="mx-1 h-6 bg-gray-500" />
      <TooltipHelper content="Tamaño vista previa">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() =>
            setFrameSize(
              FrameSize.DESKTOP === frameSize
                ? FrameSize.MOBILE
                : FrameSize.DESKTOP
            )
          }
        >
          {frameSize === FrameSize.MOBILE ? (
            <TabletSmartphone className="size-4" />
          ) : (
            <Monitor className="size-4" />
          )}
        </Button>
      </TooltipHelper>
      <Separator orientation="vertical" className="mx-1 h-6 bg-gray-500" />
      <TooltipHelper content="Copiar estilo">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
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
          className="rounded-full"
          onClick={() => onPasteProps(propsCopy)}
        >
          <ClipboardPaste className="size-4" />
        </Button>
      </TooltipHelper>
      <Separator orientation="vertical" className="mx-1 h-6 bg-gray-500" />
      <TooltipHelper content="Restringir cambios">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
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
