"use client"

import { useRouter } from "next/navigation"

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
}

export function UpgradeDialog({ open, onClose }: UpgradeDialogProps) {
  const router = useRouter()

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Actualizar a Pro</DialogTitle>
          <DialogDescription>
            Has alcanzado el límite de 10 productos en el plan gratuito.
            Actualiza a Pro para crear más productos.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => router.push("/pricing")}>
            Actualizar Ahora
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
