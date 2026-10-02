import * as React from "react"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const Spinner = React.forwardRef<
  React.ElementRef<typeof Loader2>,
  React.ComponentPropsWithoutRef<typeof Loader2>
>(({ className, ...props }, ref) => (
  <Loader2
    ref={ref}
    role="status"
    aria-label="loading"
    className={cn("size-4 animate-spin text-muted-foreground", className)}
    {...props}
  />
))
Spinner.displayName = "Spinner"

export { Spinner }
