"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Desktop } from "@phosphor-icons/react";
import { useHasMounted } from "@/lib/store";
import { cn } from "@/lib/utils";

const MODES = [
  { value: "light", label: "Light theme", icon: Sun },
  { value: "dark", label: "Dark theme", icon: Moon },
  { value: "system", label: "Match system", icon: Desktop },
] as const;

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const mounted = useHasMounted();

  return (
    <div className={cn("inline-flex items-center gap-1 rounded-full border border-line bg-raised p-1", className)}>
      {MODES.map(({ value, label, icon: Icon }) => {
        const active = mounted && theme === value;
        return (
          <button
            key={value}
            type="button"
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={cn(
              "focus-ring flex size-7 cursor-pointer items-center justify-center rounded-full transition-colors",
              active ? "bg-ocean-strong text-white" : "text-ink-faint hover:text-ink"
            )}
          >
            <Icon size={14} weight={active ? "fill" : "regular"} />
          </button>
        );
      })}
    </div>
  );
}
