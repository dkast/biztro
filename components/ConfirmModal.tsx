import useConfirm from "@/hooks/useConfirm"
import { ExclamationIcon } from "@heroicons/react/outline"
import * as AlertDialog from "@radix-ui/react-alert-dialog"
import React from "react"

import Button from "@/components/Button"

const ConfirmModal = () => {
  const { prompt, isOpen, proceed, cancel } = useConfirm()
  return (
    <AlertDialog.Root open={isOpen}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 min-h-screen bg-black bg-opacity-30 px-4 pt-4 pb-20 transition-opacity sm:block sm:p-0" />
        <div className="fixed inset-0 z-50 flex min-h-screen items-end justify-center overflow-y-auto px-4 pt-4 pb-20 sm:items-start">
          <AlertDialog.Content className="inline-block transform overflow-hidden rounded-xl bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <ExclamationIcon
                  className="h-6 w-6 text-blue-600"
                  aria-hidden="true"
                />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <AlertDialog.Title className="text-lg font-medium leading-6 text-gray-900">
                  Aviso
                </AlertDialog.Title>
                <div className="mt-2">
                  <AlertDialog.Description className="text-sm text-gray-500">
                    {prompt}
                  </AlertDialog.Description>
                </div>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-2 sm:mt-4 sm:flex-row-reverse">
              <AlertDialog.Action asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="primary"
                  onClick={proceed}
                >
                  Eliminar
                </Button>
              </AlertDialog.Action>
              <AlertDialog.Cancel asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={cancel}
                >
                  Cancelar
                </Button>
              </AlertDialog.Cancel>
            </div>
          </AlertDialog.Content>
        </div>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}

export default ConfirmModal
