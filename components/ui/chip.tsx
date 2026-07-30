"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export function Chip({ active = false, className, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "focus-ring cursor-pointer rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all duration-200 active:scale-[0.97]",
        active
          ? "border-ocean bg-ocean/10 text-ocean-strong dark:text-sky-soft"
          : "border-line-strong bg-raised text-ink-muted hover:border-ocean/40 hover:text-ink",
        className
      )}
      {...props}
    />
  );
}
