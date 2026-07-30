"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { destinations } from "@/lib/data/destinations";
import { DestinationCard } from "@/components/travel/destination-card";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

export function DestinationRail() {
  const featured = destinations.slice(0, 8);

  return (
    <section className="mx-auto max-w-6xl px-4 pb-24 md:px-8">
      <Reveal className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
            Where to next?
          </h2>
          <p className="mt-2 text-[15px] text-ink-muted">
            Twelve destinations, deeply researched. More landing soon.
          </p>
        </div>
        <Link
          href="/explore"
          className="focus-ring flex shrink-0 items-center gap-1.5 rounded-full text-sm font-medium text-ocean-strong transition-colors hover:text-ocean-deep dark:text-sky-soft"
        >
          Open Explore <ArrowRight size={15} weight="bold" />
        </Link>
      </Reveal>

      <Stagger className="rail-scroll -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 md:-mx-8 md:px-8">
        {featured.map((dest) => (
          <StaggerItem key={dest.slug} className="w-72 shrink-0 snap-start">
            <DestinationCard dest={dest} />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
