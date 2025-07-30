"use client"

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
      <DialogContent className="bg-linear-to-t from-violet-500/30 via-transparent to-transparent">
        <DialogHeader className="flex items-center gap-4 pb-6">
          <div className="rounded-full bg-linear-to-b from-amber-100 to-transparent p-2.5 dark:from-transparent dark:to-amber-900/40">
            <div className="rounded-full border border-amber-200 bg-amber-50 p-3 text-amber-400 shadow-xs dark:border-amber-800 dark:bg-amber-900/50 dark:text-amber-500">
              <CircleFadingArrowUp className="size-8" />
            </div>
          </div>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-center dark:text-violet-300">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-4 sm:flex-col">
          <RainbowButton
            onClick={() => router.push("/dashboard/settings/billing")}
          >
            Actualizar a Pro
          </RainbowButton>
          <Button variant="link" onClick={onClose}>
            Seguir en el plan gratuito
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
