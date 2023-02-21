/* This example requires Tailwind CSS v2.0+ */

import { XIcon } from "@heroicons/react/solid"
import { useState } from "react"

interface AlertProps {
  message: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

const Alert = ({ message, icon, action }: AlertProps) => {
  const [show, setShow] = useState(true)
  return (
    <>
      {show ? (
        <div className="rounded-full bg-blue-500 px-3 py-2 shadow shadow-blue-300/50">
          <div className="flex items-center">
            <div className="flex-shrink-0 text-blue-50">
              {/* <CheckCircleIcon className="h-5 w-5 text-blue-400" aria-hidden="true" /> */}
              {icon}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-50">{message}</p>
            </div>
            <div className="ml-auto">{action}</div>
            <div className="pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  className="inline-flex rounded-full bg-blue-500 p-1.5 text-blue-50 hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-blue-50"
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
