import React from "react"
import JoyRide, {
  type BeaconRenderProps,
  type CallBackProps,
  type Step,
  type TooltipRenderProps
} from "react-joyride"
import { useAtom } from "jotai"
import { Check, Play, QrCode } from "lucide-react"

import { Button } from "@/components/ui/button"
import { tourModeAtom } from "@/lib/atoms"

const steps: Step[] = [
  {
    target: ".editor-topbar",
    title: "Barra Superior",
    content: (
      <div>
        Accede a las opciones de guardado, vista previa y exportación de tu
        menú.
        <ul className="mt-2 space-y-2">
          <li className="flex items-center gap-2">
            <Play className="size-4 text-white" />
            <span>Visualiza tu menú</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="size-4 text-white" />
            <span>Guarda los cambios</span>
          </li>
          <li className="flex items-center gap-2">
            <QrCode className="size-4 text-white" />
            <span>Genera tu código QR y descargalo como imagen</span>
          </li>
          <li className="flex items-center gap-2">
            <strong className="text-white">Publicar</strong>
            <span>Publica tu menú en la web</span>
          </li>
        </ul>
      </div>
    ),
    placement: "bottom"
  },
  {
    target: ".editor-toolbar",
    title: "Barra de Herramientas",
    content: "Accede rápidamente a funciones como deshacer/rehacer.",
    placement: "top"
  },
  {
    target: ".editor-bottombar",
    title: "Barra Inferior",
    content: (
      <div>
        Accede a las opciones de elementos y temas para personalizar tu menú.
        <ul className="mt-2 space-y-2">
          <li className="flex flex-col gap-2">
            <strong className="text-white">Elementos</strong>
            <span>Agrega elementos como encabezados y texto libre.</span>
          </li>
          <li className="flex flex-col gap-2">
            <strong className="text-white">Temas</strong>
            <span>Elige un tema de color y fuente para tu menú.</span>
          </li>
          <li className="flex flex-col gap-2">
            <strong className="text-white">Secciones</strong>
            <span>
              Lista los elementos de tu menú y cambia el orden de los mismos.
            </span>
          </li>
          <li className="flex flex-col gap-2">
            <strong className="text-white">Ajustes</strong>
            <span>
              Selecciona un elemento de tu menú para despúes cambiar su
              configuración.
            </span>
          </li>
        </ul>
      </div>
    ),
    placement: "top"
  }
]

export default function MenuTourMobile() {
  const [tourMode, setTourMode] = useAtom(tourModeAtom)

  const handleCallback = (data: CallBackProps) => {
    if (data.status === "finished" || data.status === "skipped") {
      setTourMode(false)
    }
  }

  return (
    <JoyRide
      run={tourMode}
      callback={handleCallback}
      steps={steps}
      showProgress
      showSkipButton
      beaconComponent={Beacon}
      tooltipComponent={Tooltip}
      floaterProps={{
        hideArrow: true
      }}
      styles={{
        options: {
          zIndex: 1000
        }
      }}
      locale={{
        back: "Anterior",
        close: "Cerrar",
        last: "Último",
        next: "Siguiente",
        skip: "Saltar",
        open: "Abre el cuadro de diálogo de ayuda"
      }}
    />
  )
}

// Reuse the same Tooltip and Beacon components
function Tooltip({
  backProps,
  index,
  size,
  isLastStep,
  primaryProps,
  skipProps,
  step,
  tooltipProps
}: TooltipRenderProps) {
  return (
    <div
      {...tooltipProps}
      className="max-w-80 rounded-lg border border-transparent bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800"
    >
      <h3 className="mb-2 font-medium">{step.title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{step.content}</p>
      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {index + 1} de {size}
        </div>
        <div className="flex justify-end gap-x-2">
          {!isLastStep && (
            <Button {...skipProps} variant="link" size="xs">
              Saltar
            </Button>
          )}
          {index > 0 && (
            <Button {...backProps} variant="secondary" size="xs">
              Anterior
            </Button>
          )}
          <Button {...primaryProps} size="xs">
            {isLastStep ? "Terminar" : "Siguiente"}
          </Button>
        </div>
      </div>
    </div>
  )
}

const Beacon = ({
  ref,
  ...props
}: BeaconRenderProps & {
  ref: React.RefObject<HTMLButtonElement>
}) => {
  return (
    <div className="relative">
      <span className="absolute -top-1 -left-1 size-8 animate-ping rounded-full bg-blue-400" />
      <button
        ref={ref}
        {...props}
        className="absolute inset-auto inline-block size-6 rounded-full bg-blue-500 ring-4 ring-blue-400"
      />
    </div>
  )
}

Beacon.displayName = "Beacon"
