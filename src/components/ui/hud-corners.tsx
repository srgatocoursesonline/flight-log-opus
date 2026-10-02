import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const hudCornersVariants = cva(
  "pointer-events-none absolute inset-0 transition-opacity duration-300",
  {
    variants: {
      size: {
        sm: "[&>span]:h-2.5 [&>span]:w-2.5",
        md: "[&>span]:h-3.5 [&>span]:w-3.5",
        lg: "[&>span]:h-4 [&>span]:w-4",
      },
      trigger: {
        always: "opacity-100",
        hover: "opacity-0 group-hover:opacity-100",
      },
    },
    defaultVariants: {
      size: "md",
      trigger: "always",
    },
  }
)

/**
 * Corner brackets HUD — os 4 "L" característicos do cockpit.
 * Renderizar dentro de um contêiner relative.
 */
function HudCorners({
  className,
  size,
  trigger,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof hudCornersVariants>) {
  return (
    <div
      aria-hidden="true"
      className={cn(hudCornersVariants({ size, trigger }), className)}
      {...props}
    >
      <span className="absolute left-0 top-0 border-l-2 border-t-2 border-primary/40" />
      <span className="absolute right-0 top-0 border-r-2 border-t-2 border-primary/40" />
      <span className="absolute bottom-0 left-0 border-b-2 border-l-2 border-primary/40" />
      <span className="absolute bottom-0 right-0 border-b-2 border-r-2 border-primary/40" />
    </div>
  )
}

export { HudCorners, hudCornersVariants }
