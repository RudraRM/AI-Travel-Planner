import type { Destination, Interest, TravelStyle, Trip } from "@/lib/types";
import { estimateBudget } from "@/lib/engine/budget";
import { generateItinerary } from "@/lib/engine/itinerary";
import { generatePacking } from "@/lib/engine/packing";
import { uid } from "@/lib/utils";

export interface TripInput {
  dest: Destination;
  days: number;
  travelers: number;
  style: TravelStyle;
  interests: Interest[];
  startDate?: string;
  title?: string;
}

export function buildTrip(input: TripInput): Trip {
  const id = uid("trip");
  const { dest, days, travelers, style, interests, startDate } = input;
  const now = Date.now();
  return {
    id,
    slug: dest.slug,
    title: input.title ?? `${dest.name} in ${days} days`,
    days,
    travelers,
    style,
    interests,
    startDate,
    itinerary: generateItinerary(dest, days, interests, style, id),
    packing: generatePacking(dest, days, interests),
    budget: estimateBudget(dest, days, travelers, style),
    notes: "",
    createdAt: now,
    updatedAt: now,
  };
}
