import type { Activity, DayPlan, Destination, Interest, Place, Slot, TravelStyle } from "@/lib/types";
import { seededRandom, uid } from "@/lib/utils";

const ACTIVITY_COST: Record<number, number> = { 1: 10, 2: 35, 3: 90 };
const MEAL_COST: Record<number, number> = { 1: 12, 2: 40, 3: 110 };

const THEME_BY_TAG: Record<Interest, string> = {
  food: "Eat like a local",
  culture: "Culture and craft",
  nature: "Into the landscape",
  adventure: "The adrenaline day",
  beach: "Salt and sun",
  nightlife: "Slow day, big night",
  wellness: "Ease off the pace",
  history: "Layers of the past",
};

function placeCost(p: Place, ci: number) {
  const base = p.category === "restaurant" ? MEAL_COST[p.price] : ACTIVITY_COST[p.price];
  return Math.round((base * ci) / 5) * 5;
}

function toActivity(p: Place, slot: Slot, ci: number): Activity {
  return {
    id: uid("act"),
    name: p.name,
    area: p.area,
    description: p.description,
    slot,
    category: p.category,
    cost: placeCost(p, ci),
    duration: p.duration ?? (p.category === "restaurant" ? 1.5 : 2),
  };
}

function fillerActivity(dest: Destination, slot: Slot, rand: () => number): Activity {
  const pools: Record<Slot, string[]> = {
    morning: [
      `Slow breakfast at a neighborhood cafe`,
      `Early wander before ${dest.name} wakes up`,
      `Morning at your own pace`,
    ],
    afternoon: [
      `Unhurried walk through a new quarter`,
      `Cafe stop and people-watching`,
      `Free afternoon to follow your nose`,
    ],
    evening: [
      `Golden-hour viewpoint, then dinner nearby`,
      `Easy evening around your hotel's quarter`,
      `Night stroll and an early night`,
    ],
  };
  const pool = pools[slot];
  const name = pool[Math.floor(rand() * pool.length)];
  return {
    id: uid("act"),
    name,
    description: "Unstructured time. The best trips leave room for the unplanned.",
    slot,
    category: "break",
    cost: Math.round(10 * dest.costIndex),
    duration: 2,
  };
}

/**
 * Deterministic day-by-day plan builder. Scores the destination's places
 * against the traveler's interests and style, then lays them into
 * morning / afternoon / evening slots with sensible pacing.
 */
export function generateItinerary(
  dest: Destination,
  days: number,
  interests: Interest[],
  style: TravelStyle,
  seed: string
): DayPlan[] {
  const rand = seededRandom(seed);
  const priceCap = style === "budget" ? 2 : 3;

  const score = (p: Place) => {
    let s = p.rating;
    for (const t of p.tags) if (interests.includes(t)) s += 0.7;
    if (p.price > priceCap) s -= 1.6;
    if (style === "luxury" && p.price === 3) s += 0.4;
    return s + rand() * 0.5;
  };

  const daytimePool = [...dest.attractions, ...dest.experiences.filter((e) => e.slot !== "evening")]
    .map((p) => ({ p, s: score(p) }))
    .sort((a, b) => b.s - a.s)
    .map((x) => x.p);

  const eveningPool = dest.experiences
    .filter((e) => e.slot === "evening")
    .map((p) => ({ p, s: score(p) }))
    .sort((a, b) => b.s - a.s)
    .map((x) => x.p);

  const dinnerPool = [...dest.restaurants].map((p) => ({ p, s: score(p) })).sort((a, b) => b.s - a.s).map((x) => x.p);

  const takeDaytime = () => daytimePool.shift();
  const ci = dest.costIndex;
  const plans: DayPlan[] = [];

  for (let i = 0; i < days; i++) {
    const isFirst = i === 0;
    const isLast = i === days - 1 && days > 1;
    const activities: Activity[] = [];
    let theme: string;

    if (isFirst) {
      theme = "Arrive and settle in";
      activities.push({
        id: uid("act"),
        name: `Land, drop bags, first walk`,
        description: `Check in, shake off the flight, and get your bearings around the neighborhood.`,
        slot: "morning",
        category: "transit",
        cost: Math.round(20 * ci),
        duration: 2,
      });
      const gentle = takeDaytime();
      activities.push(gentle ? toActivity(gentle, "afternoon", ci) : fillerActivity(dest, "afternoon", rand));
      const dinner = dinnerPool[0];
      activities.push(
        dinner
          ? { ...toActivity(dinner, "evening", ci), description: `First-night table: ${dinner.description}` }
          : fillerActivity(dest, "evening", rand)
      );
    } else if (isLast) {
      theme = "Last light and departure";
      const morning = takeDaytime();
      activities.push(morning ? toActivity(morning, "morning", ci) : fillerActivity(dest, "morning", rand));
      activities.push({
        id: uid("act"),
        name: "Pack up and head out",
        description: "Grab one last coffee, settle up, and make your way to the airport.",
        slot: "afternoon",
        category: "transit",
        cost: Math.round(25 * ci),
        duration: 3,
      });
    } else {
      // Full days: one anchor, one secondary, one evening
      const anchor = takeDaytime();
      const isBigDay = anchor?.duration !== undefined && anchor.duration >= 6;

      const anchorTag = anchor?.tags.find((t) => interests.includes(t)) ?? anchor?.tags[0];
      theme = anchorTag ? THEME_BY_TAG[anchorTag] : "Follow your nose";

      activities.push(anchor ? toActivity(anchor, "morning", ci) : fillerActivity(dest, "morning", rand));

      if (isBigDay) {
        // A full-day outing swallows the afternoon; keep the evening gentle
        activities.push(fillerActivity(dest, "evening", rand));
      } else {
        const second = takeDaytime();
        activities.push(second ? toActivity(second, "afternoon", ci) : fillerActivity(dest, "afternoon", rand));

        const wantEveningExperience = eveningPool.length > 0 && (i % 2 === 1 || dinnerPool.length <= 1);
        if (wantEveningExperience) {
          const evening = eveningPool.shift();
          if (evening) activities.push(toActivity(evening, "evening", ci));
        } else {
          const dinner = dinnerPool[Math.min(i, dinnerPool.length - 1)];
          activities.push(dinner ? toActivity(dinner, "evening", ci) : fillerActivity(dest, "evening", rand));
        }
      }
    }

    plans.push({ id: uid("day"), index: i, theme, activities });
  }

  return plans;
}

/** A la carte activity suggestions for the itinerary editor. */
export function suggestActivities(dest: Destination, exclude: string[], limit = 6): Place[] {
  const used = new Set(exclude);
  return [...dest.attractions, ...dest.experiences, ...dest.restaurants]
    .filter((p) => !used.has(p.name))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}
