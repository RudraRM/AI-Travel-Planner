export type Climate = "tropical" | "mediterranean" | "temperate" | "alpine" | "desert" | "cold";

export type TravelStyle = "budget" | "comfort" | "luxury";

export type Interest =
  | "food"
  | "culture"
  | "nature"
  | "adventure"
  | "beach"
  | "nightlife"
  | "wellness"
  | "history";

export type Slot = "morning" | "afternoon" | "evening";

export type PlaceCategory = "attraction" | "restaurant" | "hotel" | "experience";

export interface Place {
  name: string;
  area: string;
  description: string;
  category: PlaceCategory;
  /** 1 = budget, 2 = mid, 3 = high-end */
  price: 1 | 2 | 3;
  rating: number;
  /** typical time spent, in hours */
  duration?: number;
  tags: Interest[];
  /** preferred time of day, when it matters */
  slot?: Slot;
}

export interface Destination {
  slug: string;
  name: string;
  country: string;
  region: "Asia" | "Europe" | "Africa" | "Oceania" | "North America" | "South America";
  tagline: string;
  summary: string;
  climate: Climate;
  bestSeasons: string[];
  coords: { lat: number; lng: number };
  /** cost multiplier relative to a global average of 1 */
  costIndex: number;
  /** rough round-trip economy airfare in USD from a major hub */
  flightBase: number;
  localCurrency: string;
  language: string;
  timezone: string;
  visaNote: string;
  idealDays: [number, number];
  interests: Interest[];
  imageSeed: string;
  /** gradient fallback + tint colors while imagery loads */
  palette: { from: string; to: string };
  attractions: Place[];
  restaurants: Place[];
  hotels: Place[];
  experiences: Place[];
  tips: string[];
}

export interface Activity {
  id: string;
  name: string;
  area?: string;
  description: string;
  slot: Slot;
  category: PlaceCategory | "break" | "transit";
  /** estimated per-person cost in USD */
  cost: number;
  duration: number;
}

export interface DayPlan {
  id: string;
  index: number;
  theme: string;
  activities: Activity[];
}

export interface PackingItem {
  id: string;
  label: string;
  category: string;
  checked: boolean;
  note?: string;
}

export interface BudgetBreakdown {
  flights: number;
  lodging: number;
  food: number;
  activities: number;
  transport: number;
}

export interface Trip {
  id: string;
  slug: string;
  title: string;
  days: number;
  travelers: number;
  style: TravelStyle;
  interests: Interest[];
  startDate?: string;
  itinerary: DayPlan[];
  packing: PackingItem[];
  budget: BudgetBreakdown;
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}
