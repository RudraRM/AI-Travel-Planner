"use client";

import Link from "next/link";
import { MapPin, Star } from "@phosphor-icons/react";
import type { Destination } from "@/lib/types";
import { costTier } from "@/lib/data/destinations";
import { DestinationImage } from "@/components/travel/destination-image";
import { FavoriteButton } from "@/components/travel/favorite-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function DestinationCard({
  dest,
  className,
}: {
  dest: Destination;
  className?: string;
}) {
  const tier = costTier(dest.costIndex);
  const avgRating = (
    [...dest.attractions, ...dest.experiences].reduce((s, p) => s + p.rating, 0) /
    (dest.attractions.length + dest.experiences.length)
  ).toFixed(1);

  return (
    <Link
      href={`/explore/${dest.slug}`}
      className={cn(
        "group focus-ring block overflow-hidden rounded-3xl border border-line bg-raised card-shadow transition-transform duration-300 hover:-translate-y-1",
        className
      )}
    >
      <div className="relative aspect-[4/3]">
        <div className="h-full w-full transition-transform duration-500 group-hover:scale-[1.04]">
          <DestinationImage seed={dest.imageSeed} alt={`${dest.name}, ${dest.country}`} palette={dest.palette} />
        </div>
        <FavoriteButton slug={dest.slug} className="absolute right-3 top-3" />
        <div className="absolute inset-x-4 bottom-3.5 flex items-end justify-between gap-2 text-white">
          <div>
            <h3 className="font-display text-lg font-semibold leading-tight tracking-tight">{dest.name}</h3>
            <p className="mt-0.5 flex items-center gap-1 text-[13px] text-white/80">
              <MapPin size={13} weight="fill" /> {dest.country}
            </p>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-navy/40 px-2 py-0.5 text-xs font-medium backdrop-blur-md">
            <Star size={12} weight="fill" className="text-sun" /> {avgRating}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 p-4">
        <p className="truncate text-sm text-ink-muted">{dest.tagline}</p>
        <Badge variant="neutral" className="shrink-0">
          {tier.symbol} {tier.label}
        </Badge>
      </div>
    </Link>
  );
}
