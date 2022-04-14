import React, { Fragment } from "react"
import * as AlertDialog from "@radix-ui/react-alert-dialog"
import { ExclamationIcon } from "@heroicons/react/outline"
import { Transition } from "@headlessui/react"

import Button from "@/components/Button"

const ConfirmDialog = ({ title, children, open, setOpen, onConfirm }) => {
  return (
    <AlertDialog.Root open={open} onOpenChange={open => setOpen(open)}>
      <AlertDialog.Portal>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <AlertDialog.Overlay className="fixed inset-0 z-50 min-h-screen bg-zinc-500 bg-opacity-75 px-4 pt-4 pb-20 transition-opacity sm:block sm:p-0" />
        </Transition.Child>
        <div className="fixed inset-0 z-50 flex min-h-screen items-start justify-center overflow-y-auto">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <AlertDialog.Content className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <ExclamationIcon
                    className="h-6 w-6 text-red-600"
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <AlertDialog.Title className="text-lg font-medium leading-6 text-gray-900">
                    {title}
                  </AlertDialog.Title>
                  <div className="mt-2">
                    <AlertDialog.Description className="text-sm text-gray-500">
                      {children}
                    </AlertDialog.Description>
                  </div>
                </div>
              </div>
              <div className="mt-5 gap-2 sm:mt-4 sm:flex sm:flex-row-reverse">
                <AlertDialog.Cancel asChild>
                  <Button type="button" size="sm" variant="secondary">
                    Cancelar
                  </Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    onClick={() => onConfirm()}
                  >
                    Eliminar
                  </Button>
                </AlertDialog.Action>
              </div>
            </AlertDialog.Content>
          </Transition.Child>
        </div>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}

export default ConfirmDialog
