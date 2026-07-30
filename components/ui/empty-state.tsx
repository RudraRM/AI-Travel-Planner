import * as React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action, className, ...props }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "dot-grid flex flex-col items-center justify-center rounded-3xl border border-dashed border-line-strong px-8 py-16 text-center",
        className
      )}
      {...props}
    >
      {icon && (
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-ocean/10 text-ocean">
          {icon}
        </div>
      )}
      <h3 className="font-display text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-ink-muted">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
