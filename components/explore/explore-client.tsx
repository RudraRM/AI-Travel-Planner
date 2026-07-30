"use client";

import * as React from "react";
import { MagnifyingGlass, Heart, Compass, X } from "@phosphor-icons/react";
import { destinations, regions, interestOptions, costTier } from "@/lib/data/destinations";
import type { Climate, Interest } from "@/lib/types";
import { useAppStore, useHasMounted } from "@/lib/store";
import { DestinationCard } from "@/components/travel/destination-card";
import { PageHeader } from "@/components/travel/page-header";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Stagger, StaggerItem } from "@/components/motion/reveal";

const CLIMATES: { value: Climate | "any"; label: string }[] = [
  { value: "any", label: "Any climate" },
  { value: "tropical", label: "Tropical" },
  { value: "mediterranean", label: "Mediterranean" },
  { value: "temperate", label: "Temperate" },
  { value: "alpine", label: "Alpine" },
  { value: "desert", label: "Desert" },
  { value: "cold", label: "Cold" },
];

const BUDGETS = [
  { value: "any", label: "Any budget" },
  { value: "Affordable", label: "$ Affordable" },
  { value: "Moderate", label: "$$ Moderate" },
  { value: "Premium", label: "$$$ Premium" },
];

const DURATIONS = [
  { value: "any", label: "Any length" },
  { value: "short", label: "Short, 2 to 4 days" },
  { value: "medium", label: "Medium, 5 to 7 days" },
  { value: "long", label: "Long, 8 days plus" },
];

export function ExploreClient() {
  const mounted = useHasMounted();
  const favorites = useAppStore((s) => s.favorites);
  const recentlyViewed = useAppStore((s) => s.recentlyViewed);

  const [query, setQuery] = React.useState("");
  const [region, setRegion] = React.useState("any");
  const [climate, setClimate] = React.useState("any");
  const [budget, setBudget] = React.useState("any");
  const [duration, setDuration] = React.useState("any");
  const [interests, setInterests] = React.useState<Interest[]>([]);
  const [favoritesOnly, setFavoritesOnly] = React.useState(false);

  const hasFilters =
    query !== "" || region !== "any" || climate !== "any" || budget !== "any" || duration !== "any" ||
    interests.length > 0 || favoritesOnly;

  const clearFilters = () => {
    setQuery("");
    setRegion("any");
    setClimate("any");
    setBudget("any");
    setDuration("any");
    setInterests([]);
    setFavoritesOnly(false);
  };

  const filtered = destinations.filter((d) => {
    if (query) {
      const q = query.toLowerCase();
      const hay = `${d.name} ${d.country} ${d.region} ${d.tagline}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (region !== "any" && d.region !== region) return false;
    if (climate !== "any" && d.climate !== climate) return false;
    if (budget !== "any" && costTier(d.costIndex).label !== budget) return false;
    if (duration === "short" && d.idealDays[0] > 4) return false;
    if (duration === "medium" && (d.idealDays[1] < 5 || d.idealDays[0] > 7)) return false;
    if (duration === "long" && d.idealDays[1] < 8) return false;
    if (interests.length > 0 && !interests.every((i) => d.interests.includes(i))) return false;
    if (favoritesOnly && !favorites.includes(d.slug)) return false;
    return true;
  });

  const recent = recentlyViewed
    .map((slug) => destinations.find((d) => d.slug === slug))
    .filter((d): d is NonNullable<typeof d> => Boolean(d))
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <PageHeader
        title="Explore"
        description="Twelve destinations with real depth: places to see, eat, sleep, and do."
      />

      {/* Filter bar */}
      <div className="glass sticky top-2 z-30 mt-8 rounded-3xl p-4 lg:top-4">
        <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div className="relative">
            <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search places"
              aria-label="Search destinations"
              className="pl-9"
            />
          </div>
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger aria-label="Region"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">All regions</SelectItem>
              {regions.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={climate} onValueChange={setClimate}>
            <SelectTrigger aria-label="Climate"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CLIMATES.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={budget} onValueChange={setBudget}>
            <SelectTrigger aria-label="Budget"><SelectValue /></SelectTrigger>
            <SelectContent>
              {BUDGETS.map((b) => (
                <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger aria-label="Trip length"><SelectValue /></SelectTrigger>
            <SelectContent>
              {DURATIONS.map((d) => (
                <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {interestOptions.map((opt) => (
            <Chip
              key={opt.value}
              active={interests.includes(opt.value as Interest)}
              onClick={() =>
                setInterests((prev) =>
                  prev.includes(opt.value as Interest)
                    ? prev.filter((i) => i !== opt.value)
                    : [...prev, opt.value as Interest]
                )
              }
            >
              {opt.label}
            </Chip>
          ))}
          <Chip active={favoritesOnly} onClick={() => setFavoritesOnly((v) => !v)} className="ml-auto">
            <span className="flex items-center gap-1.5">
              <Heart size={13} weight={favoritesOnly ? "fill" : "regular"} /> Favorites
              {mounted && favorites.length > 0 ? ` (${favorites.length})` : ""}
            </span>
          </Chip>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X size={13} weight="bold" /> Clear
            </Button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="mt-8">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Compass size={26} weight="fill" />}
            title="Nothing matches that mix"
            description="Loosen a filter or two. The right place is in here somewhere."
            action={
              <Button variant="secondary" onClick={clearFilters}>
                Clear all filters
              </Button>
            }
          />
        ) : (
          <Stagger key={filtered.map((d) => d.slug).join(",")} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((dest) => (
              <StaggerItem key={dest.slug}>
                <DestinationCard dest={dest} />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>

      {/* Recently viewed */}
      {mounted && recent.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display mb-5 text-xl font-semibold tracking-tight">Recently viewed</h2>
          <div className="rail-scroll -mx-4 flex snap-x gap-5 overflow-x-auto px-4 pb-4 md:-mx-8 md:px-8">
            {recent.map((dest) => (
              <div key={dest.slug} className="w-64 shrink-0 snap-start">
                <DestinationCard dest={dest} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
