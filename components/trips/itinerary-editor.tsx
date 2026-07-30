"use client";

import * as React from "react";
import { Reorder, useDragControls, useReducedMotion } from "framer-motion";
import { DotsSixVertical, PencilSimple, Trash, Plus } from "@phosphor-icons/react";
import type { Activity, DayPlan, Destination, Trip } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { suggestActivities } from "@/lib/engine/itinerary";
import { formatMoney, formatDate, addDays, type Currency } from "@/lib/format";
import { SlotIcon, SLOT_LABEL } from "@/components/travel/slot-icon";
import { ActivityDialog } from "@/components/trips/activity-dialog";
import { Button } from "@/components/ui/button";

function ActivityRow({
  trip,
  day,
  activity,
  currency,
  onEdit,
}: {
  trip: Trip;
  day: DayPlan;
  activity: Activity;
  currency: Currency;
  onEdit: (a: Activity) => void;
}) {
  const controls = useDragControls();
  const reduce = useReducedMotion();
  const removeActivity = useAppStore((s) => s.removeActivity);

  return (
    <Reorder.Item
      value={activity}
      dragListener={false}
      dragControls={controls}
      layout={reduce ? undefined : "position"}
      className="group flex items-start gap-3 rounded-2xl border border-line bg-raised p-3.5"
      whileDrag={{ scale: 1.02, boxShadow: "0 16px 40px -12px rgb(2 6 23 / 0.25)", zIndex: 10 }}
    >
      <button
        type="button"
        aria-label={`Reorder ${activity.name}`}
        onPointerDown={(e) => controls.start(e)}
        className="mt-1.5 shrink-0 cursor-grab touch-none text-ink-faint transition-colors hover:text-ink active:cursor-grabbing"
      >
        <DotsSixVertical size={18} weight="bold" />
      </button>
      <SlotIcon slot={activity.slot} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink">{activity.name}</p>
        <p className="mt-0.5 line-clamp-2 text-[13px] text-ink-muted">{activity.description}</p>
        <p className="mt-1 text-xs text-ink-faint">
          {SLOT_LABEL[activity.slot]}
          {activity.area ? ` in ${activity.area}` : ""} · {activity.duration}h
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <span className="mr-1 text-[13px] tabular-nums text-ink-faint">
          {activity.cost > 0 ? formatMoney(activity.cost, currency) : "Free"}
        </span>
        <button
          type="button"
          aria-label={`Edit ${activity.name}`}
          onClick={() => onEdit(activity)}
          className="focus-ring cursor-pointer rounded-full p-1.5 text-ink-faint transition-colors hover:bg-line/60 hover:text-ink"
        >
          <PencilSimple size={15} />
        </button>
        <button
          type="button"
          aria-label={`Remove ${activity.name}`}
          onClick={() => removeActivity(trip.id, day.id, activity.id)}
          className="focus-ring cursor-pointer rounded-full p-1.5 text-ink-faint transition-colors hover:bg-danger/10 hover:text-danger"
        >
          <Trash size={15} />
        </button>
      </div>
    </Reorder.Item>
  );
}

export function ItineraryEditor({
  trip,
  dest,
  currency,
}: {
  trip: Trip;
  dest: Destination;
  currency: Currency;
}) {
  const reorderDay = useAppStore((s) => s.reorderDay);
  const [dialog, setDialog] = React.useState<{ dayId: string; activity?: Activity } | null>(null);

  const usedNames = trip.itinerary.flatMap((d) => d.activities.map((a) => a.name));

  return (
    <div className="flex flex-col gap-5">
      {trip.itinerary.map((day) => (
        <section key={day.id} className="rounded-3xl border border-line bg-raised p-5 card-shadow">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h3 className="font-display text-base font-semibold tracking-tight">
              Day {day.index + 1}
              <span className="ml-2 font-sans text-sm font-normal text-ink-muted">{day.theme}</span>
            </h3>
            {trip.startDate && (
              <span className="text-xs text-ink-faint">{formatDate(addDays(trip.startDate, day.index))}</span>
            )}
          </div>

          {day.activities.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line-strong px-4 py-6 text-center text-sm text-ink-faint">
              A blank day. Sometimes that’s the best kind.
            </p>
          ) : (
            <Reorder.Group
              axis="y"
              values={day.activities}
              onReorder={(activities) => reorderDay(trip.id, day.id, activities)}
              className="flex flex-col gap-2.5"
            >
              {day.activities.map((activity) => (
                <ActivityRow
                  key={activity.id}
                  trip={trip}
                  day={day}
                  activity={activity}
                  currency={currency}
                  onEdit={(a) => setDialog({ dayId: day.id, activity: a })}
                />
              ))}
            </Reorder.Group>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="mt-3"
            onClick={() => setDialog({ dayId: day.id })}
          >
            <Plus size={14} weight="bold" /> Add activity
          </Button>
        </section>
      ))}

      {dialog && (
        <ActivityDialog
          tripId={trip.id}
          dayId={dialog.dayId}
          activity={dialog.activity}
          suggestions={dialog.activity ? [] : suggestActivities(dest, usedNames)}
          costIndex={dest.costIndex}
          open
          onOpenChange={(open) => {
            if (!open) setDialog(null);
          }}
        />
      )}
    </div>
  );
}
