"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

export function Slider({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>) {
  return (
    <SliderPrimitive.Root
      className={cn("relative flex w-full touch-none select-none items-center py-2", className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-line">
        <SliderPrimitive.Range className="absolute h-full rounded-full bg-ocean" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className="focus-ring block size-4 cursor-grab rounded-full border-2 border-ocean-strong bg-white shadow-md transition-transform hover:scale-110 active:cursor-grabbing dark:bg-navy"
        aria-label="Value"
      />
    </SliderPrimitive.Root>
  );
}
