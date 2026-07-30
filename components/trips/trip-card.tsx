"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DotsThree, Copy, Trash, ArrowSquareOut, CalendarBlank, Users } from "@phosphor-icons/react";
import type { Trip } from "@/lib/types";
import { getDestination } from "@/lib/data/destinations";
import { budgetTotal } from "@/lib/engine/budget";
import { formatMoney, plural, timeAgo, type Currency } from "@/lib/format";
import { useAppStore } from "@/lib/store";
import { DestinationImage } from "@/components/travel/destination-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

export function TripCard({ trip, currency }: { trip: Trip; currency: Currency }) {
  const router = useRouter();
  const duplicateTrip = useAppStore((s) => s.duplicateTrip);
  const deleteTrip = useAppStore((s) => s.deleteTrip);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const dest = getDestination(trip.slug);
  if (!dest) return null;

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-line bg-raised card-shadow transition-transform duration-300 hover:-translate-y-1">
      <Link href={`/trips/${trip.id}`} className="focus-ring block" aria-label={`Open ${trip.title}`}>
        <div className="relative aspect-[16/9]">
          <DestinationImage seed={dest.imageSeed} alt={`${dest.name}, ${dest.country}`} palette={dest.palette} />
          <div className="absolute inset-x-4 bottom-3 text-white">
            <h3 className="font-display truncate text-lg font-semibold tracking-tight">{trip.title}</h3>
            <p className="text-[13px] text-white/80">
              {dest.name}, {dest.country}
            </p>
          </div>
        </div>
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="neutral">
              <CalendarBlank size={12} /> {plural(trip.days, "day")}
            </Badge>
            <Badge variant="neutral">
              <Users size={12} /> {trip.travelers}
            </Badge>
            <Badge className="capitalize">{trip.style}</Badge>
          </div>
          <div className="mt-3 flex items-center justify-between text-[13px]">
            <span className="text-ink-faint">Edited {timeAgo(trip.updatedAt)}</span>
            <span className="font-semibold text-ink">{formatMoney(budgetTotal(trip.budget), currency)}</span>
          </div>
        </div>
      </Link>

      <div className="absolute right-3 top-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`Actions for ${trip.title}`}
              className="focus-ring flex size-9 cursor-pointer items-center justify-center rounded-full bg-navy/30 text-white backdrop-blur-md transition-colors hover:bg-navy/50"
            >
              <DotsThree size={20} weight="bold" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => router.push(`/trips/${trip.id}`)}>
              <ArrowSquareOut size={15} /> Open
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => duplicateTrip(trip.id)}>
              <Copy size={15} /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-danger" onSelect={() => setConfirmOpen(true)}>
              <Trash size={15} /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogTitle>Delete this trip?</DialogTitle>
          <DialogDescription>
            “{trip.title}” and its itinerary, budget, and packing list will be gone for good.
          </DialogDescription>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Keep it
            </Button>
            <Button
              variant="danger"
              className="bg-danger/10"
              onClick={() => {
                deleteTrip(trip.id);
                setConfirmOpen(false);
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
