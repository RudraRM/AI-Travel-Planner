"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  MapPin,
  Users,
  CalendarBlank,
  PencilSimple,
  Copy,
  Trash,
  ArrowsClockwise,
  Compass,
  Suitcase,
} from "@phosphor-icons/react";
import { getDestination } from "@/lib/data/destinations";
import { useAppStore, useHasMounted } from "@/lib/store";
import { estimateBudget, budgetTotal } from "@/lib/engine/budget";
import { generateItinerary } from "@/lib/engine/itinerary";
import { formatMoney, formatDate, plural } from "@/lib/format";
import type { TravelStyle } from "@/lib/types";
import { uid } from "@/lib/utils";
import { DestinationImage } from "@/components/travel/destination-image";
import { ItineraryEditor } from "@/components/trips/itinerary-editor";
import { BudgetBars } from "@/components/travel/budget-bars";
import { PackingList } from "@/components/travel/packing-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

const STYLE_OPTIONS: { value: TravelStyle; label: string }[] = [
  { value: "budget", label: "Budget" },
  { value: "comfort", label: "Comfort" },
  { value: "luxury", label: "Luxury" },
];

export function TripDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const mounted = useHasMounted();

  const trip = useAppStore((s) => s.trips.find((t) => t.id === id));
  const currency = useAppStore((s) => s.prefs.currency);
  const updateTrip = useAppStore((s) => s.updateTrip);
  const setItinerary = useAppStore((s) => s.setItinerary);
  const duplicateTrip = useAppStore((s) => s.duplicateTrip);
  const deleteTrip = useAppStore((s) => s.deleteTrip);
  const togglePacking = useAppStore((s) => s.togglePacking);
  const addPackingItem = useAppStore((s) => s.addPackingItem);
  const removePackingItem = useAppStore((s) => s.removePackingItem);
  const resetPacking = useAppStore((s) => s.resetPacking);

  const [renameOpen, setRenameOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [notes, setNotes] = React.useState<string | null>(null);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <Skeleton className="h-56 rounded-3xl" />
        <Skeleton className="mt-6 h-10 w-96 max-w-full rounded-full" />
        <div className="mt-6 grid gap-4">
          <Skeleton className="h-40 rounded-3xl" />
          <Skeleton className="h-40 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <EmptyState
          icon={<Suitcase size={26} weight="fill" />}
          title="Trip not found"
          description="It may have been deleted, or the link is from another device's saved data."
          action={
            <Link href="/trips" className={buttonVariants({ variant: "primary" })}>
              Back to My Trips
            </Link>
          }
        />
      </div>
    );
  }

  const dest = getDestination(trip.slug);
  if (!dest) return null;

  const total = budgetTotal(trip.budget);
  const activityCount = trip.itinerary.reduce((n, d) => n + d.activities.length, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl">
        <div className="relative h-52 md:h-64">
          <DestinationImage
            seed={dest.imageSeed}
            alt={`${dest.name}, ${dest.country}`}
            palette={dest.palette}
            sizes="(max-width: 1024px) 100vw, 66vw"
            priority
          />
        </div>
        <div className="absolute inset-x-6 bottom-5 flex flex-wrap items-end justify-between gap-3 text-white">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">{trip.title}</h1>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/85">
              <span className="flex items-center gap-1">
                <MapPin size={14} weight="fill" /> {dest.name}, {dest.country}
              </span>
              <span className="flex items-center gap-1">
                <CalendarBlank size={14} />
                {trip.startDate ? formatDate(trip.startDate) : "Dates flexible"} · {plural(trip.days, "day")}
              </span>
              <span className="flex items-center gap-1">
                <Users size={14} /> {plural(trip.travelers, "traveler")}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setTitle(trip.title);
            setRenameOpen(true);
          }}
        >
          <PencilSimple size={14} /> Rename
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            const copyId = duplicateTrip(trip.id);
            if (copyId) router.push(`/trips/${copyId}`);
          }}
        >
          <Copy size={14} /> Duplicate
        </Button>
        <Link href={`/explore/${dest.slug}`} className={buttonVariants({ variant: "secondary", size: "sm" })}>
          <Compass size={14} /> About {dest.name}
        </Link>
        <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
          <Trash size={14} /> Delete
        </Button>
        <p className="ml-auto text-sm text-ink-muted">
          {plural(activityCount, "activity", "activities")} ·{" "}
          <span className="font-semibold text-ink">{formatMoney(total, currency)}</span>
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="itinerary" className="mt-8">
        <TabsList>
          <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="packing">Packing</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="itinerary">
          <div className="mb-5 flex items-center justify-between gap-3">
            <p className="text-sm text-ink-muted">Drag to reorder. Everything is editable.</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                setItinerary(trip.id, generateItinerary(dest, trip.days, trip.interests, trip.style, uid("seed")))
              }
            >
              <ArrowsClockwise size={14} /> Regenerate all days
            </Button>
          </div>
          <ItineraryEditor trip={trip} dest={dest} currency={currency} />
        </TabsContent>

        <TabsContent value="budget">
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="rounded-3xl border border-line bg-raised p-6 card-shadow">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-display text-base font-semibold tracking-tight">Where the money goes</h3>
                <Segmented
                  options={STYLE_OPTIONS}
                  value={trip.style}
                  idPrefix="trip-style"
                  onChange={(style) =>
                    updateTrip(trip.id, {
                      style,
                      budget: estimateBudget(dest, trip.days, trip.travelers, style),
                    })
                  }
                />
              </div>
              <BudgetBars budget={trip.budget} currency={currency} />
              <p className="mt-5 text-[13px] text-ink-faint">
                Estimates for {dest.name} at {trip.style} style. Switching style re-prices the whole trip.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="glass rounded-3xl p-6">
                <p className="text-sm text-ink-muted">Trip total</p>
                <p className="font-display mt-1 text-3xl font-bold tabular-nums tracking-tight">
                  {formatMoney(total, currency)}
                </p>
              </div>
              <div className="glass rounded-3xl p-6">
                <p className="text-sm text-ink-muted">Per person</p>
                <p className="font-display mt-1 text-3xl font-bold tabular-nums tracking-tight">
                  {formatMoney(Math.round(total / trip.travelers), currency)}
                </p>
              </div>
              <div className="glass rounded-3xl p-6">
                <p className="text-sm text-ink-muted">Per day, on the ground</p>
                <p className="font-display mt-1 text-3xl font-bold tabular-nums tracking-tight">
                  {formatMoney(Math.round((total - trip.budget.flights) / trip.days), currency)}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="packing">
          <PackingList
            items={trip.packing}
            onToggle={(itemId) => togglePacking(trip.id, itemId)}
            onAdd={(label, category) => addPackingItem(trip.id, { label, category })}
            onRemove={(itemId) => removePackingItem(trip.id, itemId)}
            onReset={() => resetPacking(trip.id)}
          />
        </TabsContent>

        <TabsContent value="notes">
          <div className="max-w-2xl">
            <Label htmlFor="trip-notes">Anything worth remembering</Label>
            <Textarea
              id="trip-notes"
              rows={10}
              className="mt-2"
              placeholder="Confirmation numbers, restaurant wish list, the friend of a friend to call in town..."
              value={notes ?? trip.notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => {
                if (notes !== null && notes !== trip.notes) updateTrip(trip.id, { notes });
              }}
            />
            <p className="mt-2 text-[13px] text-ink-faint">Saved automatically when you click away.</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Rename dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogTitle>Rename trip</DialogTitle>
          <div className="mt-5 flex flex-col gap-2">
            <Label htmlFor="trip-title">Title</Label>
            <Input id="trip-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setRenameOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!title.trim()}
              onClick={() => {
                updateTrip(trip.id, { title: title.trim() });
                setRenameOpen(false);
              }}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogTitle>Delete this trip?</DialogTitle>
          <DialogDescription>
            “{trip.title}” and its itinerary, budget, and packing list will be gone for good.
          </DialogDescription>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              Keep it
            </Button>
            <Button
              variant="danger"
              className="bg-danger/10"
              onClick={() => {
                deleteTrip(trip.id);
                router.push("/trips");
              }}
            >
              Delete trip
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
