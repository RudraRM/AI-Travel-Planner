"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowSquareOut, Sparkle } from "@phosphor-icons/react";
import { destinations, getDestination } from "@/lib/data/destinations";
import { generatePacking } from "@/lib/engine/packing";
import { plural } from "@/lib/format";
import type { PackingItem } from "@/lib/types";
import { useAppStore, useHasMounted } from "@/lib/store";
import { PackingList } from "@/components/travel/packing-list";
import { PageHeader } from "@/components/travel/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";

export function PackingClient() {
  const mounted = useHasMounted();
  const trips = useAppStore((s) => s.trips);
  const togglePacking = useAppStore((s) => s.togglePacking);
  const addPackingItem = useAppStore((s) => s.addPackingItem);
  const removePackingItem = useAppStore((s) => s.removePackingItem);
  const resetPacking = useAppStore((s) => s.resetPacking);

  const [selectedTripId, setSelectedTripId] = React.useState<string | null>(null);

  // Quick-list state for people without a saved trip yet
  const [quickSlug, setQuickSlug] = React.useState("reykjavik");
  const [quickDays, setQuickDays] = React.useState(5);
  const [quickItems, setQuickItems] = React.useState<PackingItem[] | null>(null);

  const sortedTrips = [...trips].sort((a, b) => b.updatedAt - a.updatedAt);
  const activeTrip = sortedTrips.find((t) => t.id === selectedTripId) ?? sortedTrips[0];

  if (!mounted) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <PageHeader title="Packing List" description="Checklists built from climate, season, and plans." />
        <Skeleton className="mt-10 h-16 w-80 max-w-full rounded-3xl" />
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <PageHeader
        title="Packing List"
        description="Built from the destination's climate and what you've planned, not a generic template."
      />

      {trips.length > 0 && activeTrip ? (
        <div className="mt-10">
          <div className="mb-8 flex flex-wrap items-end gap-3">
            <div className="flex w-72 max-w-full flex-col gap-2">
              <Label htmlFor="packing-trip">Packing for</Label>
              <Select value={activeTrip.id} onValueChange={setSelectedTripId}>
                <SelectTrigger id="packing-trip">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortedTrips.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Link
              href={`/trips/${activeTrip.id}`}
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              <ArrowSquareOut size={14} /> Open trip
            </Link>
          </div>

          <PackingList
            items={activeTrip.packing}
            onToggle={(id) => togglePacking(activeTrip.id, id)}
            onAdd={(label, category) => addPackingItem(activeTrip.id, { label, category })}
            onRemove={(id) => removePackingItem(activeTrip.id, id)}
            onReset={() => resetPacking(activeTrip.id)}
          />
        </div>
      ) : (
        <div className="mt-10">
          <div className="glass max-w-2xl rounded-3xl p-6">
            <h2 className="font-display text-lg font-semibold tracking-tight">Try it without a trip</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Pick a destination and length for a one-off list. Save a trip and your list keeps itself in sync.
            </p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="quick-dest">Destination</Label>
                <Select value={quickSlug} onValueChange={setQuickSlug}>
                  <SelectTrigger id="quick-dest">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {destinations.map((d) => (
                      <SelectItem key={d.slug} value={d.slug}>
                        {d.name}, {d.country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>
                  Length:{" "}
                  <span className="tabular-nums text-ocean-strong dark:text-sky-soft">{plural(quickDays, "day")}</span>
                </Label>
                <Slider min={2} max={14} step={1} value={[quickDays]} onValueChange={([v]) => setQuickDays(v)} />
              </div>
            </div>
            <Button
              className="mt-6"
              onClick={() => {
                const dest = getDestination(quickSlug)!;
                setQuickItems(generatePacking(dest, quickDays, dest.interests));
              }}
            >
              <Sparkle size={15} weight="fill" /> Build the list
            </Button>
          </div>

          {quickItems && (
            <div className="mt-10">
              <PackingList
                items={quickItems}
                onToggle={(id) =>
                  setQuickItems((items) =>
                    items ? items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)) : items
                  )
                }
              />
              <p className="mt-6 text-[13px] text-ink-faint">
                This one-off list lives only on this page.{" "}
                <Link href="/plan" className="focus-ring rounded font-medium text-ocean-strong hover:text-ocean-deep dark:text-sky-soft">
                  Save a trip
                </Link>{" "}
                to keep it, sync it, and tick it off from anywhere.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
