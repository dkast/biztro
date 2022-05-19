import React from "react"
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

const Dialog = ({ children, open, setOpen }) => {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={open => setOpen(open)}>
      <AnimatePresence>
        {open ? (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={overlay}
                className="fixed inset-0 z-50 min-h-screen bg-black bg-opacity-30 px-4 pt-4 pb-20 sm:block sm:p-0"
              />
            </DialogPrimitive.Overlay>
            <div className="fixed inset-0 z-50 flex min-h-screen items-end justify-center overflow-y-auto px-4 pt-4 pb-20 sm:items-start">
              <DialogPrimitive.Content asChild forceMount>
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={dialog}
                  className="relative inline-block transform overflow-hidden rounded-xl bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle"
                >
                  {children}
                  <DialogPrimitive.Close className="absolute top-2 right-2 rounded-full p-2 text-gray-500 hover:bg-gray-100">
                    <Cross1Icon />
                  </DialogPrimitive.Close>
                </motion.div>
              </DialogPrimitive.Content>
            </div>
          </DialogPrimitive.Portal>
        ) : null}
      </AnimatePresence>
    </DialogPrimitive.Root>
  )
}

export default Dialog
