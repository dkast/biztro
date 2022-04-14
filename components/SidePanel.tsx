import React, { Fragment } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { XIcon } from "@heroicons/react/outline"

interface SidePanelProps {
  open: boolean
  setOpen: (boolean) => void
  children: React.ReactNode
  title: string
  subtitle?: string
}

const SidePanel = ({
  open,
  setOpen,
  children,
  title,
  subtitle = ""
}: SidePanelProps): JSX.Element => {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-40 overflow-hidden"
        onClose={setOpen}
      >
        <div className="absolute inset-0 overflow-hidden">
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-100"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="absolute inset-0 bg-zinc-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-100 sm:duration-300"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-100 sm:duration-200"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <div className="pointer-events-auto w-screen max-w-2xl">
                <div className="flex h-full flex-col bg-white shadow-xl">
                  {/* Header */}
                  <div className="bg-gray-50 px-4 py-6 sm:px-6">
                    <div className="flex items-start justify-between space-x-3">
                      <div className="space-y-1">
                        <Dialog.Title className="text-lg font-medium text-gray-900">
                          {title}
                        </Dialog.Title>
                        <p className="text-sm text-gray-500">{subtitle}</p>
                      </div>
                      <div className="flex h-7 items-center">
                        <button
                          type="button"
                          className="text-gray-400 hover:text-gray-500"
                          onClick={() => setOpen(false)}
                        >
                          <span className="sr-only">Close panel</span>
                          <XIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1">{children}</div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export default SidePanel
