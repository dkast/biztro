import React, { Fragment } from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Cross1Icon } from "@radix-ui/react-icons"
import { Transition } from "@headlessui/react"

export const DialogContent = React.forwardRef<
  HTMLDivElement,
  DialogPrimitive.DialogContentProps
>(({ children, ...props }, forwardedRef) => (
  <DialogPrimitive.Portal>
    <Transition show={true}>
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 min-h-screen bg-zinc-500 bg-opacity-75 px-4 pt-4 pb-20 transition-opacity sm:block sm:p-0" />
      </Transition.Child>
      <div className="fixed inset-0 z-50 flex min-h-screen items-end justify-center overflow-y-auto px-4 pt-4 pb-20 sm:items-start">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enterTo="opacity-100 translate-y-0 sm:scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 translate-y-0 sm:scale-100"
          leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <DialogPrimitive.Content
            {...props}
            ref={forwardedRef}
            className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle"
          >
            {children}
            <div className="flex justify-end">
              <DialogPrimitive.Close>
                <Cross1Icon />
              </DialogPrimitive.Close>
            </div>
          </DialogPrimitive.Content>
        </Transition.Child>
      </div>
    </Transition>
  </DialogPrimitive.Portal>
))

DialogContent.displayName = "DialogContent"

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
