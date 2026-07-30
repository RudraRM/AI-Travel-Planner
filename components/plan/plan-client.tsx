"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkle,
  Minus,
  Plus,
  FloppyDisk,
  ArrowsClockwise,
  PencilSimple,
  MapPin,
  Users,
  CalendarBlank,
  Check,
} from "@phosphor-icons/react";
import { destinations, getDestination, interestOptions, costTier } from "@/lib/data/destinations";
import { parsePrompt } from "@/lib/engine/parse";
import { buildTrip } from "@/lib/engine/trip";
import { budgetTotal } from "@/lib/engine/budget";
import { useAppStore } from "@/lib/store";
import type { Destination, Interest, Trip, TravelStyle } from "@/lib/types";
import { formatMoney, plural } from "@/lib/format";
import { PromptBox } from "@/components/travel/prompt-box";
import { DestinationImage } from "@/components/travel/destination-image";
import { ItineraryPreview } from "@/components/travel/itinerary-preview";
import { BudgetBars } from "@/components/travel/budget-bars";
import { PageHeader } from "@/components/travel/page-header";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Segmented } from "@/components/ui/segmented";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type Phase = "compose" | "choose" | "generating" | "preview";

const STAGES = [
  "Reading your brief",
  "Matching pace to your days",
  "Balancing budget and taste",
  "Laying out the days",
];

const STYLE_OPTIONS: { value: TravelStyle; label: string }[] = [
  { value: "budget", label: "Budget" },
  { value: "comfort", label: "Comfort" },
  { value: "luxury", label: "Luxury" },
];

export function PlanClient() {
  const router = useRouter();
  const params = useSearchParams();
  const addTrip = useAppStore((s) => s.addTrip);
  const pushRecent = useAppStore((s) => s.pushRecent);
  const defaultStyle = useAppStore((s) => s.prefs.defaultStyle);
  const currency = useAppStore((s) => s.prefs.currency);

  const [phase, setPhase] = React.useState<Phase>("compose");
  const [destSlug, setDestSlug] = React.useState<string>(params.get("dest") ?? "");
  const [days, setDays] = React.useState(5);
  const [travelers, setTravelers] = React.useState(2);
  const [style, setStyle] = React.useState<TravelStyle>(defaultStyle);
  const [interests, setInterests] = React.useState<Interest[]>(["culture", "food"]);
  const [startDate, setStartDate] = React.useState("");
  const [candidates, setCandidates] = React.useState<Destination[]>([]);
  const [stage, setStage] = React.useState(0);
  const [draft, setDraft] = React.useState<Trip | null>(null);
  const generationRef = React.useRef(0);

  const applyPrompt = React.useCallback((prompt: string) => {
    const parsed = parsePrompt(prompt);
    setDays(parsed.days);
    setTravelers(parsed.travelers);
    setStyle(parsed.style);
    setInterests(parsed.interests);
    if (parsed.destination) {
      setDestSlug(parsed.destination.slug);
      startGeneration(parsed.destination.slug, parsed.days, parsed.travelers, parsed.style, parsed.interests);
    } else {
      setCandidates(parsed.candidates);
      setPhase("choose");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Prompt arriving from the home page
  const initialPrompt = params.get("prompt");
  const consumedRef = React.useRef(false);
  React.useEffect(() => {
    if (initialPrompt && !consumedRef.current) {
      consumedRef.current = true;
      applyPrompt(initialPrompt);
    }
  }, [initialPrompt, applyPrompt]);

  function startGeneration(
    slug: string,
    genDays = days,
    genTravelers = travelers,
    genStyle = style,
    genInterests = interests
  ) {
    const dest = getDestination(slug);
    if (!dest) return;
    const runId = ++generationRef.current;
    setPhase("generating");
    setStage(0);

    STAGES.forEach((_, i) => {
      setTimeout(() => {
        if (generationRef.current === runId) setStage(i);
      }, i * 550);
    });

    setTimeout(() => {
      if (generationRef.current !== runId) return;
      const trip = buildTrip({
        dest,
        days: genDays,
        travelers: genTravelers,
        style: genStyle,
        interests: genInterests,
        startDate: startDate || undefined,
      });
      setDraft(trip);
      setPhase("preview");
    }, STAGES.length * 550 + 500);
  }

  function saveDraft() {
    if (!draft) return;
    addTrip(draft);
    pushRecent(draft.slug);
    router.push(`/trips/${draft.id}`);
  }

  const toggleInterest = (value: Interest) =>
    setInterests((prev) => (prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value]));

  const dest = destSlug ? getDestination(destSlug) : undefined;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <PageHeader
        title="Plan a trip"
        description="Start with a sentence, or set the dials yourself. Either way you get a full draft to edit."
      />

      <div className="mt-8">
        <PromptBox onSubmitPrompt={applyPrompt} />
      </div>

      <AnimatePresence mode="wait">
        {phase === "compose" && (
          <motion.div
            key="compose"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="glass mt-8 rounded-3xl p-6 md:p-8"
          >
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="plan-dest">Destination</Label>
                <Select value={destSlug} onValueChange={setDestSlug}>
                  <SelectTrigger id="plan-dest">
                    <SelectValue placeholder="Pick a destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {destinations.map((d) => (
                      <SelectItem key={d.slug} value={d.slug}>
                        {d.name}, {d.country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="plan-date">Start date, optional</Label>
                <Input
                  id="plan-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>
                  Trip length: <span className="tabular-nums text-ocean-strong dark:text-sky-soft">{plural(days, "day")}</span>
                </Label>
                <Slider min={2} max={14} step={1} value={[days]} onValueChange={([v]) => setDays(v)} />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Travelers</Label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="secondary"
                    size="iconSm"
                    aria-label="Fewer travelers"
                    onClick={() => setTravelers((t) => Math.max(1, t - 1))}
                  >
                    <Minus size={14} weight="bold" />
                  </Button>
                  <span className="w-8 text-center text-sm font-semibold tabular-nums">{travelers}</span>
                  <Button
                    variant="secondary"
                    size="iconSm"
                    aria-label="More travelers"
                    onClick={() => setTravelers((t) => Math.min(12, t + 1))}
                  >
                    <Plus size={14} weight="bold" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Travel style</Label>
                <Segmented options={STYLE_OPTIONS} value={style} onChange={setStyle} idPrefix="plan-style" />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Interests</Label>
                <div className="flex flex-wrap gap-2">
                  {interestOptions.map((opt) => (
                    <Chip
                      key={opt.value}
                      active={interests.includes(opt.value as Interest)}
                      onClick={() => toggleInterest(opt.value as Interest)}
                    >
                      {opt.label}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Button size="lg" disabled={!destSlug} onClick={() => startGeneration(destSlug)}>
                <Sparkle size={17} weight="fill" /> Generate itinerary
              </Button>
              {!destSlug && (
                <p className="mt-2 text-[13px] text-ink-faint">Pick a destination first, or describe your trip above.</p>
              )}
            </div>
          </motion.div>
        )}

        {phase === "choose" && (
          <motion.div
            key="choose"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8"
          >
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <p className="mr-2 text-sm text-ink-muted">Read from your brief:</p>
              <Badge>{plural(days, "day")}</Badge>
              <Badge>{plural(travelers, "traveler")}</Badge>
              <Badge className="capitalize">{style}</Badge>
              {interests.map((i) => (
                <Badge key={i} variant="neutral" className="capitalize">
                  {i}
                </Badge>
              ))}
            </div>
            <h2 className="font-display text-xl font-semibold tracking-tight">
              No single place named, so here are three that fit
            </h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {candidates.map((c) => (
                <div key={c.slug} className="overflow-hidden rounded-3xl border border-line bg-raised card-shadow">
                  <div className="relative aspect-[16/10]">
                    <DestinationImage seed={c.imageSeed} alt={`${c.name}, ${c.country}`} palette={c.palette} />
                    <div className="absolute inset-x-4 bottom-3 text-white">
                      <h3 className="font-display text-lg font-semibold tracking-tight">{c.name}</h3>
                      <p className="text-[13px] text-white/80">{c.country}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-ink-muted">{c.tagline}</p>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <Badge variant="neutral">{costTier(c.costIndex).label}</Badge>
                      <Button
                        size="sm"
                        onClick={() => {
                          setDestSlug(c.slug);
                          startGeneration(c.slug);
                        }}
                      >
                        Plan this one
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="mt-6" onClick={() => setPhase("compose")}>
              <PencilSimple size={15} /> Set the dials manually instead
            </Button>
          </motion.div>
        )}

        {phase === "generating" && (
          <motion.div
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-8"
          >
            <div className="glass flex items-center gap-4 rounded-3xl p-6">
              <motion.span
                className="text-ocean"
                animate={{ rotate: 360 }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
              >
                <Sparkle size={22} weight="fill" />
              </motion.span>
              <AnimatePresence mode="wait">
                <motion.p
                  key={stage}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="text-sm font-medium text-ink"
                >
                  {STAGES[stage]}...
                </motion.p>
              </AnimatePresence>
            </div>
            <div className="mt-6 grid gap-5 lg:grid-cols-[2fr_1fr]">
              <div className="flex flex-col gap-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="rounded-3xl border border-line bg-raised p-5">
                    <Skeleton className="h-5 w-40" />
                    <div className="mt-4 flex flex-col gap-3">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-4/5" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-5">
                <div className="rounded-3xl border border-line bg-raised p-5">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="mt-4 h-40 w-full" />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {phase === "preview" && draft && dest && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8"
          >
            {/* Draft header */}
            <div className="relative overflow-hidden rounded-3xl">
              <div className="relative h-48 md:h-56">
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
                  <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">{draft.title}</h2>
                  <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/85">
                    <span className="flex items-center gap-1"><MapPin size={14} weight="fill" /> {dest.name}, {dest.country}</span>
                    <span className="flex items-center gap-1"><CalendarBlank size={14} /> {plural(draft.days, "day")}</span>
                    <span className="flex items-center gap-1"><Users size={14} /> {plural(draft.travelers, "traveler")}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button onClick={saveDraft}>
                <FloppyDisk size={16} weight="fill" /> Save trip
              </Button>
              <Button variant="secondary" onClick={() => startGeneration(destSlug)}>
                <ArrowsClockwise size={15} /> Regenerate
              </Button>
              <Button variant="ghost" onClick={() => setPhase("compose")}>
                <PencilSimple size={15} /> Adjust the brief
              </Button>
              <p className="ml-auto text-sm text-ink-muted">
                Estimated total:{" "}
                <span className="font-semibold text-ink">{formatMoney(budgetTotal(draft.budget), currency)}</span>
              </p>
            </div>

            {/* Body */}
            <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
              <ItineraryPreview itinerary={draft.itinerary} currency={currency} startDate={draft.startDate} />
              <div className="flex flex-col gap-5">
                <div className="glass rounded-3xl p-6">
                  <h3 className="mb-5 font-display text-base font-semibold tracking-tight">Budget estimate</h3>
                  <BudgetBars budget={draft.budget} currency={currency} />
                  <p className="mt-5 border-t border-line pt-4 text-sm text-ink-muted">
                    About{" "}
                    <span className="font-semibold text-ink">
                      {formatMoney(Math.round(budgetTotal(draft.budget) / draft.travelers), currency)}
                    </span>{" "}
                    per person
                  </p>
                </div>
                <div className="glass rounded-3xl p-6">
                  <h3 className="mb-3 font-display text-base font-semibold tracking-tight">Packing preview</h3>
                  <ul className="flex flex-col gap-2">
                    {draft.packing.slice(0, 6).map((p) => (
                      <li key={p.id} className="flex items-center gap-2.5 text-sm text-ink-muted">
                        <Check size={13} weight="bold" className="shrink-0 text-emerald-strong" aria-hidden />
                        {p.label}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-[13px] text-ink-faint">
                    Plus {Math.max(0, draft.packing.length - 6)} more, ready on the Packing List tab after you save.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
