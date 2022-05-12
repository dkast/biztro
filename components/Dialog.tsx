import React, { Fragment } from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Cross1Icon } from "@radix-ui/react-icons"
import { AnimatePresence, motion } from "framer-motion"

const overlay = {
  visible: {
    opacity: 1,
    transition: {
      ease: "easeOut",
      duration: 0.2
    }
  },
  hidden: {
    opacity: 0
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
    scale: 0.95
  }
}

export const DialogContent = React.forwardRef<
  HTMLDivElement,
  DialogPrimitive.DialogContentProps
>(({ children, ...props }, forwardedRef) => (
  <AnimatePresence>
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay asChild>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={overlay}
          className="fixed inset-0 z-50 min-h-screen bg-zinc-500 bg-opacity-75 px-4 pt-4 pb-20 transition-opacity sm:block sm:p-0"
        />
      </DialogPrimitive.Overlay>
      <div className="fixed inset-0 z-50 flex min-h-screen items-end justify-center overflow-y-auto px-4 pt-4 pb-20 sm:items-start">
        <DialogPrimitive.Content
          {...props}
          asChild
          forceMount
          ref={forwardedRef}
        >
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={dialog}
            className="relative inline-block transform overflow-hidden rounded-xl bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle"
          >
            {children}
            <DialogPrimitive.Close className="absolute top-2 right-2 rounded-full p-2 text-gray-500 hover:bg-gray-50">
              <Cross1Icon />
            </DialogPrimitive.Close>
          </motion.div>
        </DialogPrimitive.Content>
      </div>
    </DialogPrimitive.Portal>
  </AnimatePresence>
))

DialogContent.displayName = "DialogContent"

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
