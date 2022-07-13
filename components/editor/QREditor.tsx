import Link from "next/link"
import { useRecoilValue } from "recoil"
import { QRCode } from "react-qrcode-logo"

import { hostState } from "@/lib/store"
import Button from "@/components/Button"

interface QREditorProps {
  siteId: string
}

const QREditor = ({ siteId }: QREditorProps): JSX.Element => {
  const host = useRecoilValue(hostState)
  return (
    <>
      <h3 className="text-lg font-medium leading-6 text-gray-900">Editor QR</h3>
      <div className="flex flex-col items-center justify-center">
        <span className="my-2 text-gray-500">
          Escanea con la cámara de tu móvil o aplicación QR o sigue{" "}
          <Link href="/app/site-preview" passHref>
            <a
              className="text-violet-500 hover:text-violet-700"
              target="_blank"
              rel="noopener noreferrer"
            >
              esta liga.
            </a>
          </Link>
        </span>
        <QRCode value={`${host}/${siteId}`} />
        <div>
          <Button variant="secondary">Guardar</Button>
        </div>
      </div>
    </>
  )
}

export default QREditor
