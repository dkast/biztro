import React from "react"
import JoyRide, { type BeaconRenderProps, type Step } from "react-joyride"

const steps: Step[] = [
  // {
  //   target: ".editor-categories",
  //   content: "This is the header of the menu editor"
  // },
  // {
  //   target: ".editor-elements",
  //   content: "This is the body of the menu editor"
  // },
  // {
  //   target: ".editor-theme",
  //   content: "This is the footer of the menu editor"
  // },
  // {
  //   target: ".editor-settings",
  //   content: "This is the toolbar of the menu editor"
  // },
  {
    target: ".editor-published",
    content: "This is the layers panel of the menu editor",
    placement: "bottom-end"
  }
]

export default function MenuTour() {
  return (
    <JoyRide
      steps={steps}
      showProgress
      showSkipButton
      beaconComponent={Beacon}
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

const Beacon = React.forwardRef<HTMLButtonElement, BeaconRenderProps>(
  (props, ref) => {
    return (
      <div className="relative">
        <span className="absolute inset-auto size-8 animate-ping rounded-full bg-blue-400" />
        <button
          ref={ref}
          {...props}
          className="absolute inset-auto inline-block size-8 rounded-full bg-blue-500"
        />
      </div>
    )
  }
)

Beacon.displayName = "Beacon"
