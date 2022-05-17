/* This example requires Tailwind CSS v2.0+ */
import { useState } from "react"
import { XIcon } from "@heroicons/react/solid"

interface AlertProps {
  message: string
  icon?: React.ReactNode
}

const Alert = ({ message, icon }: AlertProps) => {
  const [show, setShow] = useState(true)
  return (
    <>
      {show ? (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 shadow shadow-blue-100/50">
          <div className="flex">
            <div className="flex-shrink-0">
              {/* <CheckCircleIcon className="h-5 w-5 text-blue-400" aria-hidden="true" /> */}
              {icon}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-800">{message}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  className="inline-flex rounded-md bg-blue-50 p-1.5 text-blue-500 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-blue-50"
                  onClick={() => setShow(false)}
                >
                  <span className="sr-only">Cerrar</span>
                  <XIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default Alert
