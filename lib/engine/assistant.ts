import { destinations, costTier } from "@/lib/data/destinations";
import { estimateBudget, budgetTotal } from "@/lib/engine/budget";
import { generatePacking } from "@/lib/engine/packing";
import { parsePrompt } from "@/lib/engine/parse";
import { formatMoney, type Currency } from "@/lib/format";
import type { Destination, Trip } from "@/lib/types";

/**
 * Rule-based concierge. Composes answers from the destination dataset and
 * the budget / packing engines. Swap this module for a real model call
 * (keeping the same signature) to go live.
 */

export interface AssistantContext {
  trips: Trip[];
  currency: Currency;
}

export interface AssistantReply {
  content: string;
  suggestions: string[];
}

function findDestination(text: string, ctx: AssistantContext): Destination | undefined {
  const parsed = parsePrompt(text);
  if (parsed.destination) return parsed.destination;
  // Fall back to the most recently updated trip's destination
  const latest = [...ctx.trips].sort((a, b) => b.updatedAt - a.updatedAt)[0];
  return latest ? destinations.find((d) => d.slug === latest.slug) : undefined;
}

const DEFAULT_SUGGESTIONS = [
  "Where should I go in December on a budget?",
  "Do I need a visa for Japan?",
  "What should I pack for Iceland?",
  "How much is a week in Lisbon for two?",
];

export function assistantReply(message: string, ctx: AssistantContext): AssistantReply {
  const text = message.toLowerCase();
  const dest = findDestination(message, ctx);

  // Visa and entry questions
  if (/visa|entry requirement|passport|immigration|eta\b/.test(text)) {
    if (dest) {
      return {
        content: `${dest.name}, ${dest.country}: ${dest.visaNote} Rules shift, so confirm with the official source or your airline before booking. Timezone there is ${dest.timezone} and the local currency is ${dest.localCurrency}.`,
        suggestions: [
          `What should I pack for ${dest.name}?`,
          `When is the best time to visit ${dest.name}?`,
          `How much would ${dest.idealDays[0]} days in ${dest.name} cost?`,
        ],
      };
    }
    return {
      content: "Tell me which destination you're asking about and I'll pull up its entry requirements. For example: \"Do I need a visa for Vietnam?\"",
      suggestions: DEFAULT_SUGGESTIONS,
    };
  }

  // Best time / weather questions
  if (/best time|when should|weather|season|what month/.test(text)) {
    if (dest) {
      return {
        content: `The sweet spot for ${dest.name} is ${dest.bestSeasons.join(", and ")}. Its climate is ${dest.climate}, and most people find ${dest.idealDays[0]} to ${dest.idealDays[1]} days about right. A local tip: ${dest.tips[0]}`,
        suggestions: [
          `Plan a ${dest.idealDays[0]}-day trip to ${dest.name}`,
          `How much would it cost for two people?`,
          `What should I pack for ${dest.name}?`,
        ],
      };
    }
    return {
      content: "Name a destination and I'll tell you when it's at its best. If you have a month in mind instead, ask something like \"Where should I go in March?\"",
      suggestions: DEFAULT_SUGGESTIONS,
    };
  }

  // Cost and budget questions
  if (/cost|budget|expensive|cheap|how much|price/.test(text)) {
    if (dest) {
      const parsed = parsePrompt(message);
      const b = estimateBudget(dest, parsed.days, parsed.travelers, parsed.style);
      const total = budgetTotal(b);
      const tier = costTier(dest.costIndex);
      return {
        content: `A rough estimate for ${parsed.days} days in ${dest.name} for ${parsed.travelers} ${parsed.travelers === 1 ? "person" : "people"}, ${parsed.style} style: about ${formatMoney(total, ctx.currency)} all in. That breaks down to roughly ${formatMoney(b.flights, ctx.currency)} on flights, ${formatMoney(b.lodging, ctx.currency)} on accommodation, ${formatMoney(b.food, ctx.currency)} on food, and ${formatMoney(b.activities + b.transport, ctx.currency)} on activities and getting around. ${dest.name} is a ${tier.label.toLowerCase()} destination overall. The Budget tab has the full interactive breakdown.`,
        suggestions: [
          `Plan a ${parsed.days}-day trip to ${dest.name}`,
          `Same trip but budget style`,
          `When is the best time to visit ${dest.name}?`,
        ],
      };
    }
    return {
      content: "Tell me where and I'll price it out. Something like \"How much is a week in Bali for two?\" works well.",
      suggestions: DEFAULT_SUGGESTIONS,
    };
  }

  // Packing questions
  if (/pack|bring|luggage|suitcase|wear/.test(text)) {
    if (dest) {
      const parsed = parsePrompt(message);
      const items = generatePacking(dest, parsed.days, dest.interests);
      const highlights = items.filter((i) => i.category === "Clothing").slice(0, 4).map((i) => i.label.toLowerCase());
      return {
        content: `For ${dest.name} (${dest.climate} climate), build around: ${highlights.join(", ")}. Plus the usuals: documents, adapter, power bank, and sunscreen. I generated the full checklist on the Packing List tab, where you can tick things off as you go.`,
        suggestions: [
          `When is the best time to visit ${dest.name}?`,
          `Plan a trip to ${dest.name}`,
          `Do I need a visa for ${dest.country}?`,
        ],
      };
    }
    return {
      content: "Which destination are you packing for? I'll build a checklist from its climate and what you're planning to do.",
      suggestions: DEFAULT_SUGGESTIONS,
    };
  }

  // Recommendation questions
  if (/where should|recommend|suggest|ideas|inspire|somewhere/.test(text)) {
    const parsed = parsePrompt(message);
    const picks = parsed.candidates.length > 0 ? parsed.candidates : destinations.slice(0, 3);
    const lines = picks.map((d) => `${d.name}, ${d.country}: ${d.tagline.toLowerCase()}, ${costTier(d.costIndex).label.toLowerCase()} prices, best ${d.bestSeasons[0]}.`);
    return {
      content: `Based on what you described, three places worth a look. ${lines.join(" ")} Say "plan a trip to" any of them and I'll draft the full itinerary.`,
      suggestions: picks.map((d) => `Plan a trip to ${d.name}`),
    };
  }

  // Trip modification with saved trips
  if (/cheaper|reduce|save money|cut cost/.test(text) && ctx.trips.length > 0) {
    const latest = [...ctx.trips].sort((a, b) => b.updatedAt - a.updatedAt)[0];
    const d = destinations.find((x) => x.slug === latest.slug);
    if (d) {
      const cheapEats = d.restaurants.filter((r) => r.price === 1).map((r) => r.name);
      const swaps = cheapEats.length > 0 ? `Swap a big dinner for ${cheapEats.join(" or ")}.` : "Trade one paid activity for a free walking day.";
      return {
        content: `Three ways to trim "${latest.title}": drop to ${latest.style === "luxury" ? "comfort" : "budget"} style in the trip settings to see lodging fall fastest. ${swaps} And shifting dates to shoulder season (${d.bestSeasons[d.bestSeasons.length - 1]}) usually cuts flights meaningfully.`,
        suggestions: [`What should I pack for ${d.name}?`, `When is the best time to visit ${d.name}?`],
      };
    }
  }

  // Greeting / fallback
  return {
    content: "I'm your travel concierge. I can recommend destinations, check visa rules, estimate budgets, build packing lists, and draft day-by-day itineraries. Where are we dreaming about?",
    suggestions: DEFAULT_SUGGESTIONS,
  };
}
