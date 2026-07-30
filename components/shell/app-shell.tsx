"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  House,
  Sparkle,
  Suitcase,
  Compass,
  Wallet,
  ListChecks,
  ChatCircleDots,
  GearSix,
  List,
  X,
} from "@phosphor-icons/react";
import { Logo } from "@/components/shell/logo";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Home", icon: House },
  { href: "/plan", label: "Plan Trip", icon: Sparkle },
  { href: "/trips", label: "My Trips", icon: Suitcase },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/budget", label: "Budget", icon: Wallet },
  { href: "/packing", label: "Packing List", icon: ListChecks },
  { href: "/assistant", label: "Travel Assistant", icon: ChatCircleDots },
  { href: "/settings", label: "Profile & Settings", icon: GearSix },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="flex flex-col gap-1">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "focus-ring relative flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-colors",
              active ? "text-white" : "text-ink-muted hover:bg-line/50 hover:text-ink"
            )}
          >
            {active && (
              <motion.span
                layoutId="nav-active"
                className="absolute inset-0 rounded-full bg-ocean-strong shadow-[0_6px_20px_-8px_rgb(14_165_233_/_0.7)]"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <Icon size={18} weight={active ? "fill" : "regular"} className="relative z-10" />
            <span className="relative z-10">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="min-h-[100dvh]">
      {/* Desktop sidebar */}
      <aside className="glass fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-y-0 border-l-0 px-4 py-6 lg:flex">
        <Logo className="mb-8 px-2" />
        <NavLinks />
        <div className="mt-auto px-2">
          <ThemeToggle />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="glass sticky top-0 z-40 flex h-16 items-center justify-between border-x-0 border-t-0 px-4 lg:hidden">
        <Logo />
        <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
          <DialogPrimitive.Trigger
            className="focus-ring flex size-10 cursor-pointer items-center justify-center rounded-full text-ink"
            aria-label="Open menu"
          >
            <List size={22} />
          </DialogPrimitive.Trigger>
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-navy/40 backdrop-blur-sm" />
            <DialogPrimitive.Content className="glass-strong fixed inset-y-0 left-0 z-50 flex w-72 flex-col rounded-r-3xl p-5 focus:outline-none">
              <DialogPrimitive.Title className="sr-only">Navigation</DialogPrimitive.Title>
              <div className="mb-6 flex items-center justify-between">
                <Logo />
                <DialogPrimitive.Close
                  className="focus-ring flex size-9 cursor-pointer items-center justify-center rounded-full text-ink-muted hover:text-ink"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </DialogPrimitive.Close>
              </div>
              <NavLinks onNavigate={() => setOpen(false)} />
              <div className="mt-auto">
                <ThemeToggle />
              </div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      </header>

      <main className="lg:pl-60">{children}</main>
    </div>
  );
}
