"use client";

import * as React from "react";
import Link from "next/link";
import {
  Star,
  Clock,
  MapPin,
  Sparkle,
  Lightbulb,
  Translate,
  Coins,
  GlobeHemisphereEast,
  CalendarBlank,
  CurrencyCircleDollar,
  Timer,
} from "@phosphor-icons/react";
import type { Destination, Place } from "@/lib/types";
import { costTier } from "@/lib/data/destinations";
import { useAppStore } from "@/lib/store";
import { DestinationImage } from "@/components/travel/destination-image";
import { FavoriteButton } from "@/components/travel/favorite-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

function PlaceCard({ place }: { place: Place }) {
  return (
    <div className="rounded-3xl border border-line bg-raised p-5 card-shadow transition-transform duration-300 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-base font-semibold tracking-tight">{place.name}</h3>
        <span className="flex shrink-0 items-center gap-1 text-sm font-medium">
          <Star size={13} weight="fill" className="text-sun" /> {place.rating}
        </span>
      </div>
      <p className="mt-0.5 flex items-center gap-1 text-[13px] text-ink-faint">
        <MapPin size={12} /> {place.area}
      </p>
      <p className="mt-2.5 text-sm text-ink-muted">{place.description}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge variant="neutral">{"$".repeat(place.price)}</Badge>
        {place.duration && (
          <Badge variant="neutral">
            <Clock size={11} /> {place.duration}h
          </Badge>
        )}
        {place.tags.slice(0, 2).map((t) => (
          <Badge key={t} variant="outline" className="capitalize">
            {t}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function PlaceGrid({ places }: { places: Place[] }) {
  return (
    <Stagger className="grid gap-5 md:grid-cols-2">
      {places.map((p) => (
        <StaggerItem key={p.name}>
          <PlaceCard place={p} />
        </StaggerItem>
      ))}
    </Stagger>
  );
}

export function DestinationDetail({ dest }: { dest: Destination }) {
  const pushRecent = useAppStore((s) => s.pushRecent);

  React.useEffect(() => {
    pushRecent(dest.slug);
  }, [dest.slug, pushRecent]);

  const tier = costTier(dest.costIndex);

  const facts = [
    { icon: CalendarBlank, label: "Best time", value: dest.bestSeasons[0] },
    { icon: Timer, label: "Ideal length", value: `${dest.idealDays[0]} to ${dest.idealDays[1]} days` },
    { icon: Coins, label: "Cost level", value: `${tier.symbol} ${tier.label}` },
    { icon: Translate, label: "Language", value: dest.language },
    { icon: GlobeHemisphereEast, label: "Timezone", value: dest.timezone },
    { icon: CurrencyCircleDollar, label: "Currency", value: dest.localCurrency },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl">
        <div className="relative h-72 md:h-80">
          <DestinationImage
            seed={dest.imageSeed}
            alt={`${dest.name}, ${dest.country}`}
            palette={dest.palette}
            sizes="(max-width: 1024px) 100vw, 72rem"
            priority
          />
        </div>
        <FavoriteButton slug={dest.slug} className="absolute right-4 top-4 size-11" />
        <div className="absolute inset-x-6 bottom-6 flex flex-wrap items-end justify-between gap-4 text-white md:inset-x-8">
          <div>
            <p className="text-sm font-medium text-white/80">{dest.country} · {dest.region}</p>
            <h1 className="font-display mt-1 text-3xl font-bold tracking-tight md:text-5xl">{dest.name}</h1>
            <p className="mt-2 max-w-md text-[15px] text-white/85">{dest.tagline}</p>
          </div>
          <Link
            href={`/plan?dest=${dest.slug}`}
            className={buttonVariants({ variant: "primary", size: "lg" })}
          >
            <Sparkle size={17} weight="fill" /> Plan this trip
          </Link>
        </div>
      </div>

      {/* Facts */}
      <Reveal className="mt-6">
        <div className="glass grid grid-cols-2 gap-x-4 gap-y-5 rounded-3xl p-6 md:grid-cols-6">
          {facts.map(({ icon: Icon, label, value }) => (
            <div key={label}>
              <p className="flex items-center gap-1.5 text-xs text-ink-faint">
                <Icon size={13} /> {label}
              </p>
              <p className="mt-1 text-sm font-medium text-ink">{value}</p>
            </div>
          ))}
          <p className="col-span-2 border-t border-line pt-4 text-[13px] text-ink-muted md:col-span-6">
            {dest.visaNote} {dest.summary}
          </p>
        </div>
      </Reveal>

      {/* Interests */}
      <Reveal className="mt-6 flex flex-wrap gap-2">
        {dest.interests.map((i) => (
          <Badge key={i} className="capitalize">
            {i}
          </Badge>
        ))}
      </Reveal>

      {/* Places */}
      <Tabs defaultValue="attractions" className="mt-10">
        <TabsList>
          <TabsTrigger value="attractions">Attractions</TabsTrigger>
          <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
          <TabsTrigger value="hotels">Hotels</TabsTrigger>
          <TabsTrigger value="experiences">Experiences</TabsTrigger>
        </TabsList>
        <TabsContent value="attractions"><PlaceGrid places={dest.attractions} /></TabsContent>
        <TabsContent value="restaurants"><PlaceGrid places={dest.restaurants} /></TabsContent>
        <TabsContent value="hotels"><PlaceGrid places={dest.hotels} /></TabsContent>
        <TabsContent value="experiences"><PlaceGrid places={dest.experiences} /></TabsContent>
      </Tabs>

      {/* Tips */}
      <Reveal className="mt-12">
        <div className="rounded-3xl bg-tint p-7 dark:bg-raised md:p-8">
          <h2 className="font-display text-xl font-semibold tracking-tight">Know before you go</h2>
          <ul className="mt-5 grid gap-4 md:grid-cols-3">
            {dest.tips.map((tip) => (
              <li key={tip} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-sun/20 text-sunset">
                  <Lightbulb size={15} weight="fill" />
                </span>
                <p className="text-sm text-ink-muted">{tip}</p>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </div>
  );
}
