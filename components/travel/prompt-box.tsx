"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sparkle, ArrowRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "A week in Japan for two, culture and food",
  "Budget beach escape in December, solo",
  "5 days of adventure in Patagonia",
  "Luxury Amalfi Coast long weekend",
];

interface PromptBoxProps {
  className?: string;
  autoFocus?: boolean;
  onSubmitPrompt?: (prompt: string) => void;
}

/**
 * The natural-language trip brief. Standalone it routes to /plan;
 * with onSubmitPrompt it hands the prompt to the parent.
 */
export function PromptBox({ className, autoFocus, onSubmitPrompt }: PromptBoxProps) {
  const router = useRouter();
  const [value, setValue] = React.useState("");

  const submit = (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    if (onSubmitPrompt) {
      onSubmitPrompt(trimmed);
    } else {
      router.push(`/plan?prompt=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(value);
        }}
        className="glass-strong flex items-end gap-2 rounded-3xl p-3 transition-shadow focus-within:shadow-[0_0_0_2px_var(--color-ocean)]"
      >
        <span className="mb-2.5 ml-2 shrink-0 text-ocean">
          <Sparkle size={20} weight="fill" />
        </span>
        <textarea
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit(value);
            }
          }}
          rows={2}
          placeholder="Describe your trip: where, how long, who's coming..."
          aria-label="Describe your trip"
          className="max-h-40 w-full resize-none bg-transparent py-2 text-[15px] text-ink outline-none placeholder:text-ink-faint"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          aria-label="Plan this trip"
          className="focus-ring flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-ocean-strong text-white shadow-[0_8px_24px_-8px_rgb(14_165_233_/_0.6)] transition-all hover:bg-ocean-pressed active:scale-95 disabled:opacity-40"
        >
          <ArrowRight size={18} weight="bold" />
        </button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => submit(s)}
            className="focus-ring cursor-pointer rounded-full border border-line-strong bg-surface px-3 py-1.5 text-[13px] text-ink-muted backdrop-blur-sm transition-colors hover:border-ocean/50 hover:text-ink"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
