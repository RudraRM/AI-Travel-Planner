import type { Climate, Destination, Interest, PackingItem } from "@/lib/types";
import { uid } from "@/lib/utils";

type Draft = { label: string; category: string; note?: string };

const ESSENTIALS: Draft[] = [
  { label: "Passport", note: "Check it has 6+ months of validity" , category: "Documents" },
  { label: "Travel insurance details", category: "Documents" },
  { label: "Booking confirmations, offline copies", category: "Documents" },
  { label: "Bank cards plus some cash", category: "Documents" },
  { label: "Day pack", category: "Essentials" },
  { label: "Refillable water bottle", category: "Essentials" },
  { label: "Personal medications", category: "Health" },
  { label: "Basic first aid kit", category: "Health" },
  { label: "Sunscreen", category: "Health" },
  { label: "Phone and charger", category: "Tech" },
  { label: "Power bank", category: "Tech" },
  { label: "Universal travel adapter", category: "Tech" },
  { label: "Offline maps downloaded", category: "Tech" },
];

const CLOTHING_BY_CLIMATE: Record<Climate, Draft[]> = {
  tropical: [
    { label: "Breathable shirts", note: "One per day-ish, they will get sweaty", category: "Clothing" },
    { label: "Light shorts and trousers", category: "Clothing" },
    { label: "Swimwear", category: "Clothing" },
    { label: "Sandals plus one pair of real shoes", category: "Clothing" },
    { label: "Packable rain shell", note: "Tropical downpours arrive fast", category: "Clothing" },
    { label: "Sun hat and sunglasses", category: "Clothing" },
  ],
  mediterranean: [
    { label: "Light layers for warm days", category: "Clothing" },
    { label: "One warm layer for evenings", category: "Clothing" },
    { label: "Swimwear", category: "Clothing" },
    { label: "Comfortable walking shoes", note: "Cobbles and stairs everywhere", category: "Clothing" },
    { label: "Sun hat and sunglasses", category: "Clothing" },
  ],
  temperate: [
    { label: "Layers you can add and shed", category: "Clothing" },
    { label: "Light waterproof jacket", category: "Clothing" },
    { label: "Comfortable walking shoes", category: "Clothing" },
    { label: "One smarter outfit", category: "Clothing" },
  ],
  alpine: [
    { label: "Broken-in hiking boots", category: "Clothing" },
    { label: "Wool hiking socks", category: "Clothing" },
    { label: "Fleece or midlayer", category: "Clothing" },
    { label: "Insulated jacket", category: "Clothing" },
    { label: "Waterproof shell, top and bottom", category: "Clothing" },
    { label: "Beanie and gloves", note: "Even in summer at altitude", category: "Clothing" },
  ],
  desert: [
    { label: "Loose, long-sleeved layers", note: "Sun cover beats bare skin", category: "Clothing" },
    { label: "Scarf or shemagh", note: "Dust, sun, and modesty in one", category: "Clothing" },
    { label: "Sturdy sandals and closed shoes", category: "Clothing" },
    { label: "Warm layer for cold desert nights", category: "Clothing" },
  ],
  cold: [
    { label: "Thermal base layers", category: "Clothing" },
    { label: "Insulated parka", category: "Clothing" },
    { label: "Waterproof over-layer", note: "Wind and sideways rain are the norm", category: "Clothing" },
    { label: "Warm hat, gloves, wool socks", category: "Clothing" },
    { label: "Waterproof boots with grip", category: "Clothing" },
  ],
};

const BY_INTEREST: Partial<Record<Interest, Draft[]>> = {
  beach: [
    { label: "Reef-safe sunscreen", category: "Beach" },
    { label: "Snorkel mask", note: "Rentals exist but your own fits", category: "Beach" },
    { label: "Sarong or beach towel", category: "Beach" },
    { label: "Water shoes", category: "Beach" },
  ],
  adventure: [
    { label: "Trail shoes", category: "Activity gear" },
    { label: "Blister kit and tape", category: "Activity gear" },
    { label: "Dry bag", category: "Activity gear" },
    { label: "Electrolyte tabs", category: "Activity gear" },
  ],
  wellness: [
    { label: "Swimsuit for pools and baths", category: "Wellness" },
    { label: "Flip flops for spa floors", category: "Wellness" },
  ],
  nightlife: [{ label: "One dressier evening outfit", category: "Clothing" }],
  nature: [{ label: "Compact binoculars", note: "Wildlife and viewpoints earn them", category: "Activity gear" }],
};

export function generatePacking(dest: Destination, days: number, interests: Interest[]): PackingItem[] {
  const drafts: Draft[] = [...ESSENTIALS, ...CLOTHING_BY_CLIMATE[dest.climate]];

  for (const i of interests) {
    const extra = BY_INTEREST[i];
    if (extra) drafts.push(...extra);
  }

  if (dest.climate === "tropical") {
    drafts.push({ label: "Insect repellent", note: "Dusk is mosquito rush hour", category: "Health" });
  }
  if (dest.region === "Asia" || dest.region === "Africa") {
    drafts.push({ label: "Modest cover-ups for temples and old towns", category: "Clothing" });
  }
  if (/visa|e-visa|eTA|authorization/i.test(dest.visaNote)) {
    drafts.push({ label: "Entry paperwork sorted", note: dest.visaNote, category: "Documents" });
  }
  if (days >= 7) {
    drafts.push({ label: "Travel detergent for a mid-trip wash", category: "Essentials" });
  }

  // De-duplicate by label, preserve first occurrence
  const seen = new Set<string>();
  return drafts
    .filter((d) => (seen.has(d.label) ? false : (seen.add(d.label), true)))
    .map((d) => ({ id: uid("pack"), label: d.label, category: d.category, note: d.note, checked: false }));
}

export const PACKING_CATEGORY_ORDER = [
  "Documents",
  "Essentials",
  "Clothing",
  "Beach",
  "Activity gear",
  "Wellness",
  "Health",
  "Tech",
];
