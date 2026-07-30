"use client";

import { SunHorizon, SunDim, MoonStars } from "@phosphor-icons/react";
import type { Slot } from "@/lib/types";
import { cn } from "@/lib/utils";

export const SLOT_LABEL: Record<Slot, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

export function SlotIcon({ slot, className }: { slot: Slot; className?: string }) {
  const Icon = slot === "morning" ? SunHorizon : slot === "afternoon" ? SunDim : MoonStars;
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full bg-ocean/10 text-ocean-deep",
        className
      )}
    >
      <Icon size={15} weight="fill" />
    </span>
  );
}
