import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-ocean/10 text-ocean-strong dark:bg-ocean/20 dark:text-sky-soft",
        neutral: "bg-line/70 text-ink-muted",
        success: "bg-emerald-brand/12 text-emerald-strong dark:text-mint",
        warm: "bg-sunset/12 text-sunset",
        outline: "border border-line-strong text-ink-muted",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
