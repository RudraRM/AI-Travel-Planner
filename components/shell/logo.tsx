import Link from "next/link";
import { AirplaneTilt } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("focus-ring flex items-center gap-2.5 rounded-full", className)}>
      <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-ocean to-ocean-deep text-white shadow-[0_6px_16px_-6px_rgb(14_165_233_/_0.6)]">
        <AirplaneTilt size={18} weight="fill" />
      </span>
      <span className="font-display text-lg font-bold tracking-tight">Meridian</span>
    </Link>
  );
}
