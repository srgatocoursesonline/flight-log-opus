import * as React from "react"
import { toast as sonner } from "sonner"

type ToastInput = {
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: "default" | "destructive"
  duration?: number
  action?: {
    label: React.ReactNode
    onClick: () => void
  }
}

/**
 * API compatível com o use-toast shadcn (Radix), respaldada pelo Sonner.
 * Único canal de toast do app — o Toaster Radix foi removido.
 */
function toast({ title, description, variant, duration, action }: ToastInput) {
  const message = title ?? description ?? ""
  const options = {
    description: title && description ? description : undefined,
    duration,
    action,
  }

  if (variant === "destructive") {
    sonner.error(message, options)
  } else {
    sonner(message, options)
  }
}

function useToast() {
  return React.useMemo(() => ({ toast }), [])
}

export { useToast, toast }
