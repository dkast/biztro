"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"

interface MenuSyncDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rememberChoice: boolean
  onRememberChoiceChange: (checked: boolean) => void
  onCancel: () => void
  onConfirm: () => void
  isLoading?: boolean
  description?: string
  checkboxId?: string
}

export function MenuSyncDialog({
  open,
  onOpenChange,
  rememberChoice,
  onRememberChoiceChange,
  onCancel,
  onConfirm,
  isLoading = false,
  description = "Se detectaron cambios en tus productos. ¿Quieres aplicar los cambios al menú publicado?",
  checkboxId = "remember-published-choice"
}: MenuSyncDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Actualizar menús publicados?</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-center gap-2">
          <Checkbox
            id={checkboxId}
            checked={rememberChoice}
            onCheckedChange={checked =>
              onRememberChoiceChange(checked === true)
            }
          />
          <label
            htmlFor={checkboxId}
            className="text-muted-foreground text-sm"
          >
            No volver a preguntar
          </label>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={isLoading}>
            No ahora
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Actualizando..." : "Actualizar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
