import React from "react"
import JoyRide, {
  type BeaconRenderProps,
  type CallBackProps,
  type Step,
  type TooltipRenderProps
} from "react-joyride"
import { useAtom } from "jotai"

import { Button } from "@/components/ui/button"
import { tourModeAtom } from "@/lib/atoms"

const steps: Step[] = [
  {
    target: ".editor-categories",
    title: "Categorías y Productos",
    content:
      "Aquí puedes ver las categorías y productos de tu menú. Puedes arrastrar y soltar elementos para reorganizarlos.",
    placement: "right"
  },
  {
    target: ".editor-elements",
    title: "Elementos",
    content:
      "Puedes agregar a tu menú elementos como encabezados y texto libre.",
    placement: "right"
  },
  {
    target: ".editor-theme",
    title: "Tema",
    content: (
      <span>
        Elige un tema de color y fuente para tu menú. Puedes elegir{" "}
        <strong>Personalizar tema</strong> para escoger tu propia paleta de
        colores.
      </span>
    ),
    placement: "left",
    placementBeacon: "left-start"
  },
  {
    target: ".editor-settings",
    title: "Ajustes",
    content:
      "En esta sección puedes cambiar la configuración de tu menú, como el tamaño del texto y la alineación de los elementos.",
    placement: "left",
    placementBeacon: "left-start"
  },
  {
    target: ".editor-published",
    title: "Publicar y generar tu código QR",
    content:
      "Una vez que hayas terminado de diseñar tu menú, puedes publicarlo y generar un código QR para que tus clientes puedan acceder a él.",
    placement: "bottom-end"
  }
]

export default function MenuTour() {
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
      className="max-w-96 rounded-lg border border-transparent bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800"
    >
      <h3 className="mb-2 font-medium">{step.title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{step.content}</p>
      <div className="mt-8 flex items-center justify-between">
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
            {isLastStep ? "Terminar" : "Cerrar"}
          </Button>
        </div>
      </div>
    </div>
  )
}

const Beacon = React.forwardRef<HTMLButtonElement, BeaconRenderProps>(
  (props, ref) => {
    return (
      <div className="relative">
        <span className="absolute -left-1 -top-1 size-8 animate-ping rounded-full bg-blue-400" />
        <button
          ref={ref}
          {...props}
          className="absolute inset-auto inline-block size-6 rounded-full bg-blue-500 ring-4 ring-blue-300"
        />
      </div>
    )
  }
)

Beacon.displayName = "Beacon"
