"use client";

import { Sparkle, CalendarCheck, Wallet, ListChecks, SunHorizon, ForkKnife, MoonStars } from "@phosphor-icons/react";
import { getDestination } from "@/lib/data/destinations";
import { estimateBudget } from "@/lib/engine/budget";
import { BudgetBars } from "@/components/travel/budget-bars";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";

/**
 * Everything shown in these tiles is real product output: the sample day
 * comes from the Kyoto dataset and the bars from the budget engine.
 */
export function FeatureBento() {
  const kyoto = getDestination("kyoto")!;
  const sampleBudget = estimateBudget(kyoto, 5, 2, "comfort");
  const sampleDay = [
    { icon: SunHorizon, slot: "Morning", place: kyoto.attractions[0] },
    { icon: ForkKnife, slot: "Afternoon", place: kyoto.attractions[4] },
    { icon: MoonStars, slot: "Evening", place: kyoto.experiences[1] },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 pb-24 md:px-8">
      <Reveal className="mb-10 max-w-xl">
        <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          From one prompt to a complete plan
        </h2>
        <p className="mt-2 text-[15px] text-ink-muted">
          Itinerary, budget, and packing list, generated together and editable everywhere.
        </p>
      </Reveal>

      <Stagger className="grid grid-cols-1 gap-5 md:grid-cols-12">
        {/* The prompt */}
        <StaggerItem className="md:col-span-7">
          <div className="flex h-full flex-col rounded-3xl bg-gradient-to-br from-ocean-deep to-navy p-7 text-white">
            <Sparkle size={24} weight="fill" className="mb-4 text-sun" />
            <h3 className="font-display text-xl font-semibold tracking-tight">Say it like you’d say it to a friend</h3>
            <p className="mt-2 max-w-md text-sm text-white/90">
              Destination, dates, budget, group, taste. In any order, in plain words. Meridian reads the brief and builds around it.
            </p>
            <p className="mt-6 rounded-2xl bg-white/10 px-4 py-3 font-mono text-[13px] text-white/90 backdrop-blur-sm">
              “10 days in Japan for two, mid-range budget, we live for food and old temples”
            </p>
          </div>
        </StaggerItem>

        {/* Real sample day */}
        <StaggerItem className="md:col-span-5">
          <div className="flex h-full flex-col rounded-3xl border border-line bg-raised p-7 card-shadow">
            <CalendarCheck size={24} className="mb-4 text-ocean" />
            <h3 className="font-display text-xl font-semibold tracking-tight">A day-by-day draft</h3>
            <ul className="mt-4 flex flex-col gap-3">
              {sampleDay.map(({ icon: Icon, slot, place }) => (
                <li key={slot} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-ocean/10 text-ocean">
                    <Icon size={14} weight="fill" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{place.name}</p>
                    <p className="text-xs text-ink-faint">{slot} · {place.area}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-ink-faint">Drag to reorder, tap to edit, regenerate any day.</p>
          </div>
        </StaggerItem>

        {/* Real budget bars */}
        <StaggerItem className="md:col-span-5">
          <div className="flex h-full flex-col rounded-3xl border border-line bg-tint p-7 dark:bg-raised">
            <Wallet size={24} className="mb-4 text-ocean" />
            <h3 className="font-display text-xl font-semibold tracking-tight">Priced before you book</h3>
            <p className="mb-5 mt-2 text-sm text-ink-muted">Five days in Kyoto for two, comfort style:</p>
            <BudgetBars budget={sampleBudget} currency="USD" />
          </div>
        </StaggerItem>

        {/* Packing */}
        <StaggerItem className="md:col-span-7">
          <div className="flex h-full flex-col rounded-3xl border border-line bg-raised p-7 card-shadow">
            <ListChecks size={24} className="mb-4 text-ocean" />
            <h3 className="font-display text-xl font-semibold tracking-tight">Packed for the climate, not a template</h3>
            <p className="mt-2 max-w-md text-sm text-ink-muted">
              The checklist reads your destination’s weather and your planned activities before it suggests a single sock.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge variant="neutral">Layers you can shed</Badge>
              <Badge variant="neutral">Broken-in walking shoes</Badge>
              <Badge variant="neutral">Universal adapter</Badge>
              <Badge variant="success">Entry paperwork sorted</Badge>
              <Badge variant="neutral">Offline maps</Badge>
            </div>
          </div>
        </StaggerItem>
      </Stagger>
    </section>
  );
}
