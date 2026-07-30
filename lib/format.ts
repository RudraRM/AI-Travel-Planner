export type Currency = "USD" | "EUR" | "GBP" | "JPY" | "AUD" | "INR";

/** Static conversion snapshot from USD, used for display only. */
const RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.93,
  GBP: 0.79,
  JPY: 152,
  AUD: 1.52,
  INR: 84,
};

const SYMBOL_LOCALE: Record<Currency, string> = {
  USD: "en-US",
  EUR: "de-DE",
  GBP: "en-GB",
  JPY: "ja-JP",
  AUD: "en-AU",
  INR: "en-IN",
};

export function formatMoney(usd: number, currency: Currency = "USD") {
  const value = usd * RATES[currency];
  return new Intl.NumberFormat(SYMBOL_LOCALE[currency], {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(iso?: string) {
  if (!iso) return "Dates flexible";
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function addDays(iso: string, days: number) {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function plural(n: number, word: string, pluralForm?: string) {
  return `${n} ${n === 1 ? word : (pluralForm ?? `${word}s`)}`;
}

export function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
