"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { BudgetBreakdown } from "@/lib/types";
import { BUDGET_CATEGORIES, budgetTotal } from "@/lib/engine/budget";
import { formatMoney, type Currency } from "@/lib/format";

/**
 * Horizontal magnitude bars, single ocean hue, values in ink.
 * Bars are thin with rounded data-ends; labels are always visible,
 * so no tooltip layer is required.
 */
export function BudgetBars({
  budget,
  currency,
}: {
  budget: BudgetBreakdown;
  currency: Currency;
}) {
  const reduce = useReducedMotion();
  const total = budgetTotal(budget);
  const max = Math.max(...BUDGET_CATEGORIES.map((c) => budget[c.key]));

  return (
    <div className="flex flex-col gap-4">
      {BUDGET_CATEGORIES.map(({ key, label }, i) => {
        const value = budget[key];
        const pct = total > 0 ? Math.round((value / total) * 100) : 0;
        const width = max > 0 ? (value / max) * 100 : 0;
        return (
          <div key={key}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <span className="text-sm text-ink-muted">{label}</span>
              <span className="text-sm font-medium tabular-nums text-ink">
                {formatMoney(value, currency)}
                <span className="ml-1.5 text-xs font-normal text-ink-faint">{pct}%</span>
              </span>
            </div>
            <div className="h-2 w-full rounded-full" role="presentation">
              <motion.div
                className="h-2 rounded-full bg-ocean-deep"
                initial={reduce ? { width: `${width}%` } : { width: 0 }}
                whileInView={{ width: `${width}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
