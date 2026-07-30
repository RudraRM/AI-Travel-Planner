"use client";

import Link from "next/link";
import { Suitcase, Plus } from "@phosphor-icons/react";
import { useAppStore, useHasMounted } from "@/lib/store";
import { TripCard } from "@/components/trips/trip-card";
import { PageHeader } from "@/components/travel/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { buttonVariants } from "@/components/ui/button";

export function TripsClient() {
  const mounted = useHasMounted();
  const trips = useAppStore((s) => s.trips);
  const currency = useAppStore((s) => s.prefs.currency);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <PageHeader
        title="My Trips"
        description="Saved plans live here. Duplicate one to riff on it, or open it to keep editing."
        actions={
          <Link href="/plan" className={buttonVariants({ variant: "primary", size: "md" })}>
            <Plus size={16} weight="bold" /> New trip
          </Link>
        }
      />

      <div className="mt-10">
        {!mounted ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="aspect-[16/13] rounded-3xl" />
            ))}
          </div>
        ) : trips.length === 0 ? (
          <EmptyState
            icon={<Suitcase size={26} weight="fill" />}
            title="No trips yet"
            description="Describe a trip in a sentence and Meridian will draft the itinerary, budget, and packing list."
            action={
              <Link href="/plan" className={buttonVariants({ variant: "primary", size: "md" })}>
                Plan your first trip
              </Link>
            }
          />
        ) : (
          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <StaggerItem key={trip.id}>
                <TripCard trip={trip} currency={currency} />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>
    </div>
  );
}
