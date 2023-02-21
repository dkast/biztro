import useLocalStorage from "@/hooks/useLocalStorage"
import Link from "next/link"
import { useRef, useState } from "react"
import { SketchPicker } from "react-color"
import { QRCode } from "react-qrcode-logo"
import { useRecoilValue } from "recoil"

import Button from "@/components/Button"
import {
  ToolbarPopover,
  ToolbarPopoverContent,
  ToolbarPopoverTrigger
} from "@/components/editor/ToolbarPopover"
import {
  ToolbarSwitch,
  ToolbarSwitchThumb
} from "@/components/editor/ToolbarSwitch"

import exportAsImage from "@/lib/export-as-image"
import rgbToHex from "@/lib/rgba-to-hex"
import { hostState } from "@/lib/store"
import { COLORS } from "@/lib/types"

interface QREditorProps {
  siteId: string
  logo?: string
  fgColor?: Record<"r" | "g" | "b" | "a", number>
}

const QREditor = ({
  siteId,
  logo,
  fgColor = { r: 0, g: 0, b: 0, a: 1 }
}: QREditorProps): JSX.Element => {
  const host = useRecoilValue(hostState)
  const exportRef = useRef()
  const [color, setColor] = useLocalStorage<
    Record<"r" | "g" | "b" | "a", number>
  >("color", fgColor)
  const [showLogo, setShowLogo] = useLocalStorage<boolean>("logo", false)

  return <>
    <h3 className="text-lg font-medium leading-6 text-gray-900">Editor QR</h3>
    <div className="flex flex-col items-center justify-center">
      <span className="mt-2 text-sm text-gray-500">
        Al escanear el código con la cámara de tu móvil o aplicación QR te
        llevará a la siguiente dirección:{" "}
        <Link
          href={`${host}/${siteId}`}
          passHref
          className="text-violet-500 hover:text-violet-700"
          target="_blank"
          rel="noopener noreferrer">

          {`${host}/${siteId}`}

        </Link>
      </span>
      <div className="my-6 rounded-lg border-2 border-dashed border-gray-300">
        <div ref={exportRef} className="p-1">
          <QRCode
            value={`${host}/${siteId}`}
            ecLevel={showLogo ? "H" : "M"}
            logoImage={showLogo ? logo : ""}
            logoWidth={showLogo ? 50 : 0}
            removeQrCodeBehindLogo={showLogo}
            enableCORS
            fgColor={rgbToHex(`rgba(${Object.values(color)})`)}
          />
        </div>
      </div>
      <div className="flex w-full justify-between px-2 py-4">
        <div className="flex items-center gap-4">
          <label>Color</label>
          <ToolbarPopover>
            <ToolbarPopoverTrigger>
              <div
                className="h-5 w-12 rounded border border-black/10"
                style={{
                  backgroundColor: `rgba(${Object.values(color)})`
                }}
              ></div>
            </ToolbarPopoverTrigger>
            <ToolbarPopoverContent>
              <SketchPicker
                disableAlpha
                presetColors={COLORS}
                color={color}
                onChange={color => {
                  setColor(color.rgb)
                }}
              ></SketchPicker>
            </ToolbarPopoverContent>
          </ToolbarPopover>
        </div>
        <div className="flex items-center gap-4">
          <label className={logo ? "" : "text-gray-400"}>Mostrar Logo</label>
          <ToolbarSwitch
            checked={showLogo}
            disabled={logo ? false : true}
            onCheckedChange={value => setShowLogo(value)}
          >
            <ToolbarSwitchThumb />
          </ToolbarSwitch>
        </div>
      </div>
      <div className="w-full">
        <Button
          variant="primary"
          mode="full"
          onClick={() => exportAsImage(exportRef.current, siteId)}
        >
          Descargar imagen QR
        </Button>
      </div>
    </div>
  </>;
}

export default QREditor
