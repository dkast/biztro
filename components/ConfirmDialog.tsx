import React from "react"
import * as AlertDialog from "@radix-ui/react-alert-dialog"
import { ExclamationIcon } from "@heroicons/react/outline"
import { AnimatePresence, motion } from "framer-motion"

import Button from "@/components/Button"

const overlay = {
  visible: {
    opacity: 1,
    transition: {
      ease: "easeOut",
      duration: 0.2
    }
  },
  hidden: {
    opacity: 0,
    transition: {
      ease: "easeIn",
      duration: 0.1
    }
  }
}

const dialog = {
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      ease: "easeOut",
      duration: 0.2
    }
  },
  hidden: {
    opacity: 0,
    y: 4,
    scale: 0.95,
    transition: {
      ease: "easeIn",
      duration: 0.2
    }
  }
}

const ConfirmDialog = ({ title, children, open, setOpen, onConfirm }) => {
  return (
    <AlertDialog.Root open={open} onOpenChange={open => setOpen(open)}>
      <AnimatePresence>
        {open ? (
          <AlertDialog.Portal>
            <AlertDialog.Overlay asChild forceMount>
              <motion.div
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={overlay}
                className="fixed inset-0 z-50 min-h-screen bg-black bg-opacity-30 px-4 pt-4 pb-20 sm:block sm:p-0"
              />
            </AlertDialog.Overlay>
            <div className="fixed inset-0 z-50 flex min-h-screen items-end justify-center overflow-y-auto px-4 pt-4 pb-20 sm:items-start">
              <AlertDialog.Content asChild forceMount>
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={dialog}
                  className="relative inline-block transform overflow-hidden rounded-xl bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle"
                >
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
                  <div className="mt-5 flex flex-col gap-2 sm:mt-4 sm:flex-row-reverse">
                    <AlertDialog.Action asChild>
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        onClick={() => onConfirm()}
                      >
                        Eliminar
                      </Button>
                    </AlertDialog.Action>
                    <AlertDialog.Cancel asChild>
                      <Button type="button" size="sm" variant="secondary">
                        Cancelar
                      </Button>
                    </AlertDialog.Cancel>
                  </div>
                </motion.div>
              </AlertDialog.Content>
            </div>
          </AlertDialog.Portal>
        ) : null}
      </AnimatePresence>
    </AlertDialog.Root>
  )
}

export default ConfirmDialog
