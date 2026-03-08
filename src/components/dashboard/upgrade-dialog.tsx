"use client"

import { useCallback, useState } from "react"
import { CircleFadingArrowUp } from "lucide-react"
import { useRouter } from "next/navigation"

import { RainbowButton } from "@/components/magicui/rainbow-button"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"

interface UpgradeDialogProps {
  open: boolean
  onClose: () => void
  title: string
  description: string
}

export function UpgradeDialog({
  open,
  onClose,
  title,
  description
}: UpgradeDialogProps) {
  const router = useRouter()

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="bg-linear-to-t from-indigo-300 via-transparent to-transparent
          dark:from-indigo-500"
      >
        <DialogHeader className="flex items-center gap-4 pb-6">
          <div
            className="rounded-full bg-linear-to-b from-amber-100 to-transparent
              p-2.5 dark:from-transparent dark:to-amber-900/40"
          >
            <div
              className="rounded-full border border-amber-200 bg-amber-50 p-3
                text-amber-400 shadow-xs dark:border-amber-800
                dark:bg-amber-900/50 dark:text-amber-500"
            >
              <CircleFadingArrowUp className="size-8" />
            </div>
          </div>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-center dark:text-indigo-300">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-4 sm:flex-col">
          <RainbowButton
            onClick={() => router.push("/dashboard/settings/billing")}
          >
            Actualizar a Pro
          </RainbowButton>
          <Button
            variant="link"
            onClick={onClose}
            className="dark:text-indigo-300"
          >
            Seguir en el plan gratuito
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Hook to guard actions behind the Pro plan.
// Usage: const { guard, openDialog, dialog } = useProGuard(isPro)
// then call `guard(() => doProAction())` or render `dialog` anywhere in the tree.
export function useProGuard(
  isPro: boolean,
  opts?: { title?: string; description?: string }
) {
  const [open, setOpen] = useState(false)
  const onClose = useCallback(() => setOpen(false), [])

  const guard = useCallback(
    (action: () => void) => {
      if (isPro) {
        action()
        return true
      }
      setOpen(true)
      return false
    },
    [isPro]
  )

  const dialog = (
    <UpgradeDialog
      open={open}
      onClose={onClose}
      title={opts?.title ?? "Actualizar a Pro"}
      description={opts?.description ?? "Esta función requiere Pro."}
    />
  )

  return { guard, openDialog: () => setOpen(true), dialog }
}

// Simple wrapper component to conditionally render children for Pro users,
// otherwise opens the UpgradeDialog when the children are interacted with.
export function ProGuard({
  isPro,
  children,
  title,
  description
}: {
  isPro: boolean
  children: React.ReactNode
  title?: string
  description?: string
}) {
  const [open, setOpen] = useState(false)
  const onClose = useCallback(() => setOpen(false), [])

  if (isPro) return <>{children}</>

  return (
    <>
      <div onClick={() => setOpen(true)}>{children}</div>
      <UpgradeDialog
        open={open}
        onClose={onClose}
        title={title ?? "Actualizar a Pro"}
        description={description ?? "Esta función requiere Pro."}
      />
    </>
  )
}
