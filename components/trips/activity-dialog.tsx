"use client";

import * as React from "react";
import { Plus, Star } from "@phosphor-icons/react";
import type { Activity, Place, Slot } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { uid } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

interface ActivityDialogProps {
  tripId: string;
  dayId: string;
  activity?: Activity;
  suggestions?: Place[];
  costIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SLOTS: { value: Slot; label: string }[] = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
];

export function ActivityDialog({
  tripId,
  dayId,
  activity,
  suggestions = [],
  costIndex,
  open,
  onOpenChange,
}: ActivityDialogProps) {
  const upsertActivity = useAppStore((s) => s.upsertActivity);
  const isEdit = Boolean(activity);

  // The dialog is mounted fresh per open (see ItineraryEditor), so
  // initializing from props here is safe without a sync effect.
  const [name, setName] = React.useState(activity?.name ?? "");
  const [description, setDescription] = React.useState(activity?.description ?? "");
  const [slot, setSlot] = React.useState<Slot>(activity?.slot ?? "afternoon");
  const [cost, setCost] = React.useState(String(activity?.cost ?? 0));
  const [duration, setDuration] = React.useState(String(activity?.duration ?? 2));

  function save() {
    if (!name.trim()) return;
    upsertActivity(tripId, dayId, {
      id: activity?.id ?? uid("act"),
      name: name.trim(),
      area: activity?.area,
      description: description.trim(),
      slot,
      category: activity?.category ?? "experience",
      cost: Math.max(0, Number(cost) || 0),
      duration: Math.max(0.5, Number(duration) || 2),
    });
    onOpenChange(false);
  }

  function addSuggestion(p: Place) {
    upsertActivity(tripId, dayId, {
      id: uid("act"),
      name: p.name,
      area: p.area,
      description: p.description,
      slot: p.slot === "morning" || p.slot === "evening" ? p.slot : "afternoon",
      category: p.category,
      cost: Math.round((p.price === 1 ? 10 : p.price === 2 ? 35 : 90) * costIndex),
      duration: p.duration ?? 2,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogTitle>{isEdit ? "Edit activity" : "Add an activity"}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? "Tweak the details; the day's flow updates instantly."
            : "Pull from places Meridian knows here, or write your own."}
        </DialogDescription>

        {!isEdit && suggestions.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-[13px] font-medium text-ink">Worth considering</p>
            <ul className="flex flex-col gap-2">
              {suggestions.slice(0, 4).map((p) => (
                <li key={p.name} className="flex items-center gap-3 rounded-2xl border border-line bg-raised p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{p.name}</p>
                    <p className="flex items-center gap-2 text-xs text-ink-faint">
                      <span className="flex items-center gap-0.5">
                        <Star size={11} weight="fill" className="text-sun" /> {p.rating}
                      </span>
                      {p.area}
                    </p>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => addSuggestion(p)}>
                    <Plus size={13} weight="bold" /> Add
                  </Button>
                </li>
              ))}
            </ul>
            <p className="mt-4 mb-1 text-[13px] font-medium text-ink">Or create your own</p>
          </div>
        )}

        <div className="mt-4 grid gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="act-name">Name</Label>
            <Input id="act-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Sunset kayak on the bay" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="act-desc">Notes</Label>
            <Textarea
              id="act-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Anything future-you should remember"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="act-slot">Time of day</Label>
              <Select value={slot} onValueChange={(v) => setSlot(v as Slot)}>
                <SelectTrigger id="act-slot">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SLOTS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="act-cost">Cost, USD</Label>
              <Input
                id="act-cost"
                type="number"
                min="0"
                inputMode="numeric"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="act-duration">Hours</Label>
              <Input
                id="act-duration"
                type="number"
                min="0.5"
                step="0.5"
                inputMode="decimal"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={!name.trim()}>
            {isEdit ? "Save changes" : "Add activity"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
