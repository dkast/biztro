import Link from "next/link"
import { useRef } from "react"
import { useRecoilValue } from "recoil"
import { QRCode } from "react-qrcode-logo"

import { hostState } from "@/lib/store"
import Button from "@/components/Button"
import exportAsImage from "@/lib/export-as-image"

interface QREditorProps {
  siteId: string
}

const QREditor = ({ siteId }: QREditorProps): JSX.Element => {
  const host = useRecoilValue(hostState)
  const exportRef = useRef()
  return (
    <>
      <h3 className="text-lg font-medium leading-6 text-gray-900">Editor QR</h3>
      <div className="flex flex-col items-center justify-center">
        <span className="mt-2 text-sm text-gray-500">
          Al escanear el código con la cámara de tu móvil o aplicación QR te
          llevará a la siguiente dirección:{" "}
          <Link href={`${host}/${siteId}`} passHref>
            <a
              className="text-violet-500 hover:text-violet-700"
              target="_blank"
              rel="noopener noreferrer"
            >
              {`${host}/${siteId}`}
            </a>
          </Link>
        </span>
        <div className="my-6 rounded-lg border-2 border-dashed border-gray-300">
          <div ref={exportRef} className="p-1">
            <QRCode value={`${host}/${siteId}`} />
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
    </>
  )
}

export default QREditor
