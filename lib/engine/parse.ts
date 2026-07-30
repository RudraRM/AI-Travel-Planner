import { destinations } from "@/lib/data/destinations";
import type { Destination, Interest, TravelStyle } from "@/lib/types";

export interface ParsedPrompt {
  destination?: Destination;
  candidates: Destination[];
  days: number;
  travelers: number;
  style: TravelStyle;
  interests: Interest[];
  month?: string;
  raw: string;
}

const ALIASES: Record<string, string> = {
  bali: "ubud",
  indonesia: "ubud",
  japan: "kyoto",
  greece: "santorini",
  iceland: "reykjavik",
  morocco: "marrakech",
  "new zealand": "queenstown",
  portugal: "lisbon",
  patagonia: "el-chalten",
  "fitz roy": "el-chalten",
  argentina: "el-chalten",
  italy: "amalfi",
  positano: "amalfi",
  vietnam: "hanoi",
  canada: "banff",
  rockies: "banff",
  tanzania: "zanzibar",
};

const INTEREST_WORDS: Record<Interest, string[]> = {
  food: ["food", "foodie", "eat", "culinary", "restaurant", "street food", "coffee"],
  culture: ["culture", "cultural", "museum", "art", "temple", "local life", "market"],
  nature: ["nature", "outdoors", "mountain", "lake", "waterfall", "scenery", "landscape", "hiking", "hike"],
  adventure: ["adventure", "adrenaline", "bungy", "bungee", "surf", "trek", "climb", "kayak", "dive"],
  beach: ["beach", "island", "swim", "snorkel", "sun", "coast", "sea"],
  nightlife: ["nightlife", "party", "bar", "club", "night out"],
  wellness: ["wellness", "spa", "yoga", "relax", "unwind", "slow", "retreat", "massage"],
  history: ["history", "historic", "ancient", "ruins", "heritage"],
};

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

export function parsePrompt(raw: string): ParsedPrompt {
  const text = raw.toLowerCase();

  // Destination: direct name, country, or alias match
  let destination: Destination | undefined;
  for (const d of destinations) {
    if (text.includes(d.name.toLowerCase()) || text.includes(d.country.toLowerCase()) || text.includes(d.slug)) {
      destination = d;
      break;
    }
  }
  if (!destination) {
    for (const [alias, slug] of Object.entries(ALIASES)) {
      if (text.includes(alias)) {
        destination = destinations.find((d) => d.slug === slug);
        break;
      }
    }
  }

  // Duration
  let days = 5;
  const dayMatch = text.match(/(\d{1,2})\s*(?:-?\s*day|days|night|nights)/);
  if (dayMatch) {
    days = Math.min(14, Math.max(2, parseInt(dayMatch[1], 10)));
  } else if (/long weekend/.test(text)) {
    days = 4;
  } else if (/weekend/.test(text)) {
    days = 3;
  } else if (/two weeks|2 weeks|fortnight/.test(text)) {
    days = 14;
  } else if (/\bweek\b/.test(text)) {
    days = 7;
  }

  // Group size
  let travelers = 2;
  const groupMatch = text.match(/(?:family|group|party)\s+of\s+(\d{1,2})/) ?? text.match(/for\s+(\d{1,2})\s+(?:people|travelers|adults|friends)/);
  if (groupMatch) {
    travelers = Math.min(12, Math.max(1, parseInt(groupMatch[1], 10)));
  } else if (/\bsolo\b|by myself|on my own/.test(text)) {
    travelers = 1;
  } else if (/couple|honeymoon|partner|two of us|anniversary/.test(text)) {
    travelers = 2;
  } else if (/friends/.test(text)) {
    travelers = 4;
  } else if (/family/.test(text)) {
    travelers = 4;
  }

  // Style
  let style: TravelStyle = "comfort";
  if (/luxur|5-star|five star|high end|splurge|premium/.test(text)) style = "luxury";
  else if (/budget|cheap|backpack|shoestring|affordable|save money/.test(text)) style = "budget";
  const capMatch = text.match(/(?:under|less than|max|around|about)\s*\$?\s*([\d,]{3,6})/);
  if (capMatch) {
    const cap = parseInt(capMatch[1].replace(/,/g, ""), 10);
    const perPersonDay = cap / Math.max(1, days) / Math.max(1, travelers);
    if (perPersonDay < 130) style = "budget";
    else if (perPersonDay > 400) style = "luxury";
  }

  // Interests
  const interests: Interest[] = [];
  for (const [interest, words] of Object.entries(INTEREST_WORDS) as [Interest, string[]][]) {
    if (words.some((w) => text.includes(w))) interests.push(interest);
  }

  // Month
  const month = MONTHS.find((m) => text.includes(m));

  // If no direct destination, rank candidates by fit
  let candidates: Destination[] = [];
  if (!destination) {
    candidates = [...destinations]
      .map((d) => {
        let score = 0;
        for (const i of interests) if (d.interests.includes(i)) score += 2;
        if (style === "budget" && d.costIndex < 0.9) score += 1.5;
        if (style === "luxury" && d.costIndex > 1.1) score += 1;
        if (days >= d.idealDays[0] && days <= d.idealDays[1]) score += 1;
        return { d, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((x) => x.d);
  }

  return {
    destination,
    candidates,
    days,
    travelers,
    style,
    interests: interests.length > 0 ? interests : ["culture", "food"],
    month,
    raw,
  };
}
