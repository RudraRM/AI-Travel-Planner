"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Check, Plus, Trash, ArrowCounterClockwise } from "@phosphor-icons/react";
import type { PackingItem } from "@/lib/types";
import { PACKING_CATEGORY_ORDER } from "@/lib/engine/packing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PackingListProps {
  items: PackingItem[];
  onToggle: (id: string) => void;
  onAdd?: (label: string, category: string) => void;
  onRemove?: (id: string) => void;
  onReset?: () => void;
}

export function PackingList({ items, onToggle, onAdd, onRemove, onReset }: PackingListProps) {
  const [newItem, setNewItem] = React.useState("");
  const checked = items.filter((i) => i.checked).length;
  const pct = items.length > 0 ? Math.round((checked / items.length) * 100) : 0;

  const grouped = PACKING_CATEGORY_ORDER.map((cat) => ({
    cat,
    items: items.filter((i) => i.category === cat),
  })).filter((g) => g.items.length > 0);
  const other = items.filter((i) => !PACKING_CATEGORY_ORDER.includes(i.category));
  if (other.length > 0) grouped.push({ cat: "Extras", items: other });

  return (
    <div>
      {/* Progress */}
      <div className="mb-8 flex items-center gap-4">
        <div className="relative size-16 shrink-0">
          <svg viewBox="0 0 64 64" className="size-16 -rotate-90">
            <circle cx="32" cy="32" r="27" fill="none" stroke="var(--line)" strokeWidth="6" />
            <motion.circle
              cx="32"
              cy="32"
              r="27"
              fill="none"
              stroke="var(--color-emerald-strong)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 27}
              animate={{ strokeDashoffset: 2 * Math.PI * 27 * (1 - pct / 100) }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold tabular-nums">
            {pct}%
          </span>
        </div>
        <div>
          <p className="font-display text-lg font-semibold tracking-tight">
            {checked} of {items.length} packed
          </p>
          <p className="text-sm text-ink-muted">
            {pct === 100 ? "Bag's ready. Go catch that flight." : "Tick things off as they go in the bag."}
          </p>
        </div>
        {onReset && checked > 0 && (
          <Button variant="ghost" size="sm" onClick={onReset} className="ml-auto">
            <ArrowCounterClockwise size={14} /> Reset
          </Button>
        )}
      </div>

      {/* Groups */}
      <div className="columns-1 gap-5 md:columns-2">
        {grouped.map(({ cat, items: group }) => (
          <div key={cat} className="mb-5 break-inside-avoid rounded-3xl border border-line bg-raised p-5 card-shadow">
            <h3 className="mb-3 font-display text-sm font-semibold tracking-tight">{cat}</h3>
            <ul className="flex flex-col">
              {group.map((item) => (
                <li key={item.id} className="group flex items-center gap-3 py-1.5">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={item.checked}
                    aria-label={item.label}
                    onClick={() => onToggle(item.id)}
                    className={cn(
                      "focus-ring flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-md border transition-all duration-200 active:scale-90",
                      item.checked
                        ? "border-emerald-strong bg-emerald-strong text-white"
                        : "border-line-strong bg-raised hover:border-emerald-strong/60"
                    )}
                  >
                    {item.checked && <Check size={12} weight="bold" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm transition-colors",
                        item.checked ? "text-ink-faint line-through" : "text-ink"
                      )}
                    >
                      {item.label}
                    </p>
                    {item.note && <p className="text-xs text-ink-faint">{item.note}</p>}
                  </div>
                  {onRemove && (
                    <button
                      type="button"
                      aria-label={`Remove ${item.label}`}
                      onClick={() => onRemove(item.id)}
                      className="focus-ring cursor-pointer rounded-full p-1 text-ink-faint opacity-0 transition-opacity hover:text-danger group-hover:opacity-100 focus-visible:opacity-100"
                    >
                      <Trash size={14} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Add item */}
      {onAdd && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!newItem.trim()) return;
            onAdd(newItem.trim(), "Extras");
            setNewItem("");
          }}
          className="mt-2 flex max-w-md gap-2"
        >
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Add your own item"
            aria-label="Add your own item"
          />
          <Button type="submit" variant="secondary" disabled={!newItem.trim()}>
            <Plus size={15} weight="bold" /> Add
          </Button>
        </form>
      )}
    </div>
  );
}
