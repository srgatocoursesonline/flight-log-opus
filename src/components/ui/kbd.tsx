import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const kbdVariants = cva(
  "inline-flex select-none items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground",
        outline: "bg-background text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Kbd({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLElement> & VariantProps<typeof kbdVariants>) {
  return <kbd className={cn(kbdVariants({ variant }), className)} {...props} />
}

function KbdGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center gap-1", className)} {...props} />
}

export { Kbd, KbdGroup }
