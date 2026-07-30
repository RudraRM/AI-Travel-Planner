"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SegmentedProps<T extends string> {
  options: { value: T; label: string; hint?: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  idPrefix?: string;
}

export function Segmented<T extends string>({ options, value, onChange, className, idPrefix = "seg" }: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      className={cn("inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-line bg-raised p-1", className)}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "focus-ring relative shrink-0 cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              active ? "text-white" : "text-ink-muted hover:text-ink"
            )}
          >
            {active && (
              <motion.span
                layoutId={`${idPrefix}-pill`}
                className="absolute inset-0 rounded-full bg-ocean-strong"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
