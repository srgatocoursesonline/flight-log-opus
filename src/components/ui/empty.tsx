import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const emptyVariants = cva(
  "flex min-w-0 flex-1 flex-col items-center justify-center gap-2 rounded-lg text-center",
  {
    variants: {
      variant: {
        default: "py-10",
        compact: "py-6",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Empty({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof emptyVariants>) {
  return (
    <div
      role="status"
      className={cn(emptyVariants({ variant }), className)}
      {...props}
    />
  )
}

function EmptyHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex max-w-sm flex-col items-center gap-1", className)}
      {...props}
    />
  )
}

function EmptyMedia({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mb-2 flex size-11 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-muted-foreground [&_svg]:size-5",
        className
      )}
      {...props}
    />
  )
}

function EmptyTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-base font-semibold text-foreground", className)}
      {...props}
    />
  )
}

function EmptyDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm leading-relaxed text-muted-foreground", className)}
      {...props}
    />
  )
}

function EmptyContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mt-3 flex gap-2", className)} {...props} />
  )
}

export { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent }
