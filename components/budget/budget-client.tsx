"use client";

import * as React from "react";
import Link from "next/link";
import { Minus, Plus, ArrowRight, Wallet } from "@phosphor-icons/react";
import { destinations, getDestination } from "@/lib/data/destinations";
import { estimateBudget, budgetTotal } from "@/lib/engine/budget";
import { formatMoney, plural } from "@/lib/format";
import type { TravelStyle } from "@/lib/types";
import { useAppStore, useHasMounted } from "@/lib/store";
import { BudgetBars } from "@/components/travel/budget-bars";
import { PageHeader } from "@/components/travel/page-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

const STYLES: TravelStyle[] = ["budget", "comfort", "luxury"];

export function BudgetClient() {
  const mounted = useHasMounted();
  const trips = useAppStore((s) => s.trips);
  const currency = useAppStore((s) => s.prefs.currency);

  const [slug, setSlug] = React.useState("lisbon");
  const [days, setDays] = React.useState(5);
  const [travelers, setTravelers] = React.useState(2);
  const [style, setStyle] = React.useState<TravelStyle>("comfort");

  const dest = getDestination(slug)!;
  const budget = estimateBudget(dest, days, travelers, style);
  const total = budgetTotal(budget);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <PageHeader
        title="Budget"
        description="Dial in a destination, length, and style. The estimate updates as you move."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        {/* Controls */}
        <div className="glass h-fit rounded-3xl p-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="budget-dest">Destination</Label>
              <Select value={slug} onValueChange={setSlug}>
                <SelectTrigger id="budget-dest">
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
                Trip length:{" "}
                <span className="tabular-nums text-ocean-strong dark:text-sky-soft">{plural(days, "day")}</span>
              </Label>
              <Slider min={2} max={14} step={1} value={[days]} onValueChange={([v]) => setDays(v)} />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Travelers</Label>
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  size="iconSm"
                  aria-label="Fewer travelers"
                  onClick={() => setTravelers((t) => Math.max(1, t - 1))}
                >
                  <Minus size={14} weight="bold" />
                </Button>
                <span className="w-8 text-center text-sm font-semibold tabular-nums">{travelers}</span>
                <Button
                  variant="secondary"
                  size="iconSm"
                  aria-label="More travelers"
                  onClick={() => setTravelers((t) => Math.min(12, t + 1))}
                >
                  <Plus size={14} weight="bold" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Travel style</Label>
              <div className="grid grid-cols-3 gap-2">
                {STYLES.map((s) => {
                  const styleTotal = budgetTotal(estimateBudget(dest, days, travelers, s));
                  const active = s === style;
                  return (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setStyle(s)}
                      className={cn(
                        "focus-ring cursor-pointer rounded-2xl border p-3 text-left transition-all duration-200 active:scale-[0.98]",
                        active
                          ? "border-ocean bg-ocean/10"
                          : "border-line bg-raised hover:border-ocean/40"
                      )}
                    >
                      <p className="text-xs font-medium capitalize text-ink-muted">{s}</p>
                      <p className="mt-1 text-sm font-semibold tabular-nums text-ink">
                        {formatMoney(styleTotal, currency)}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <div className="glass rounded-3xl p-5 max-md:col-span-2">
              <p className="text-sm text-ink-muted">Trip total</p>
              <p className="font-display mt-1 text-3xl font-bold tabular-nums tracking-tight">
                {formatMoney(total, currency)}
              </p>
            </div>
            <div className="glass rounded-3xl p-5">
              <p className="text-sm text-ink-muted">Per person</p>
              <p className="font-display mt-1 text-2xl font-bold tabular-nums tracking-tight">
                {formatMoney(Math.round(total / travelers), currency)}
              </p>
            </div>
            <div className="glass rounded-3xl p-5">
              <p className="text-sm text-ink-muted">Per day on the ground</p>
              <p className="font-display mt-1 text-2xl font-bold tabular-nums tracking-tight">
                {formatMoney(Math.round((total - budget.flights) / days), currency)}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-line bg-raised p-6 card-shadow">
            <h3 className="font-display mb-6 text-base font-semibold tracking-tight">
              {dest.name} for {plural(travelers, "person", "people")}, {style} style
            </h3>
            <BudgetBars budget={budget} currency={currency} />
            <p className="mt-6 text-[13px] text-ink-faint">
              Rough planning numbers from typical prices, not live quotes. Flights assume round trips from a major hub.
            </p>
          </div>
        </div>
      </div>

      {/* Saved trips */}
      {mounted && trips.length > 0 && (
        <Reveal className="mt-14">
          <h2 className="font-display mb-5 text-xl font-semibold tracking-tight">Your saved trips</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => {
              const d = getDestination(trip.slug);
              if (!d) return null;
              return (
                <Link
                  key={trip.id}
                  href={`/trips/${trip.id}`}
                  className="focus-ring group flex items-center gap-4 rounded-3xl border border-line bg-raised p-4 card-shadow transition-transform duration-300 hover:-translate-y-0.5"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ocean/10 text-ocean">
                    <Wallet size={17} weight="fill" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{trip.title}</p>
                    <p className="text-xs text-ink-faint">
                      {d.name} · {plural(trip.days, "day")} · {plural(trip.travelers, "traveler")}
                    </p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-ink">
                    {formatMoney(budgetTotal(trip.budget), currency)}
                  </span>
                  <ArrowRight size={15} className="text-ink-faint transition-transform group-hover:translate-x-0.5" />
                </Link>
              );
            })}
          </div>
        </Reveal>
      )}
    </div>
  );
}
