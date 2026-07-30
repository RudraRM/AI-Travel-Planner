import type { BudgetBreakdown, Destination, TravelStyle } from "@/lib/types";

/** Per-unit daily baselines in USD at costIndex 1. */
const LODGING_PER_ROOM: Record<TravelStyle, number> = { budget: 45, comfort: 140, luxury: 380 };
const FOOD_PER_PERSON: Record<TravelStyle, number> = { budget: 28, comfort: 65, luxury: 150 };
const ACTIVITIES_PER_PERSON: Record<TravelStyle, number> = { budget: 18, comfort: 45, luxury: 100 };
const TRANSPORT_PER_PERSON: Record<TravelStyle, number> = { budget: 10, comfort: 22, luxury: 55 };
const FLIGHT_FACTOR: Record<TravelStyle, number> = { budget: 0.85, comfort: 1.1, luxury: 2.4 };

const round10 = (n: number) => Math.round(n / 10) * 10;

export function estimateBudget(
  dest: Destination,
  days: number,
  travelers: number,
  style: TravelStyle
): BudgetBreakdown {
  const rooms = Math.max(1, Math.ceil(travelers / 2));
  const nights = Math.max(1, days - 1);
  const ci = dest.costIndex;

  return {
    flights: round10(dest.flightBase * FLIGHT_FACTOR[style] * travelers),
    lodging: round10(LODGING_PER_ROOM[style] * ci * rooms * nights),
    food: round10(FOOD_PER_PERSON[style] * ci * travelers * days),
    activities: round10(ACTIVITIES_PER_PERSON[style] * ci * travelers * days),
    transport: round10(TRANSPORT_PER_PERSON[style] * ci * travelers * days),
  };
}

export function budgetTotal(b: BudgetBreakdown) {
  return b.flights + b.lodging + b.food + b.activities + b.transport;
}

export const BUDGET_CATEGORIES: { key: keyof BudgetBreakdown; label: string }[] = [
  { key: "flights", label: "Flights" },
  { key: "lodging", label: "Accommodation" },
  { key: "food", label: "Food and drink" },
  { key: "activities", label: "Activities" },
  { key: "transport", label: "Local transport" },
];
