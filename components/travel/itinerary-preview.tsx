"use client";

import type { DayPlan } from "@/lib/types";
import { formatMoney, formatDate, addDays, type Currency } from "@/lib/format";
import { SlotIcon } from "@/components/travel/slot-icon";
import { Stagger, StaggerItem } from "@/components/motion/reveal";

/** Read-only itinerary timeline, used for freshly generated previews. */
export function ItineraryPreview({
  itinerary,
  currency,
  startDate,
}: {
  itinerary: DayPlan[];
  currency: Currency;
  startDate?: string;
}) {
  return (
    <Stagger className="relative flex flex-col gap-4">
      {itinerary.map((day) => (
        <StaggerItem key={day.id}>
          <div className="rounded-3xl border border-line bg-raised p-5 card-shadow">
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <h3 className="font-display text-base font-semibold tracking-tight">
                Day {day.index + 1}
                <span className="ml-2 font-sans text-sm font-normal text-ink-muted">{day.theme}</span>
              </h3>
              {startDate && (
                <span className="text-xs text-ink-faint">{formatDate(addDays(startDate, day.index))}</span>
              )}
            </div>
            <ul className="flex flex-col gap-3">
              {day.activities.map((a) => (
                <li key={a.id} className="flex items-start gap-3">
                  <SlotIcon slot={a.slot} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">{a.name}</p>
                    <p className="mt-0.5 line-clamp-2 text-[13px] text-ink-muted">{a.description}</p>
                  </div>
                  <span className="shrink-0 text-[13px] tabular-nums text-ink-faint">
                    {a.cost > 0 ? formatMoney(a.cost, currency) : "Free"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
