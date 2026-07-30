"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Desktop, DownloadSimple, Trash, UserCircle } from "@phosphor-icons/react";
import { interestOptions } from "@/lib/data/destinations";
import type { Interest, TravelStyle } from "@/lib/types";
import type { Currency } from "@/lib/format";
import { useAppStore, useHasMounted } from "@/lib/store";
import { PageHeader } from "@/components/travel/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Segmented } from "@/components/ui/segmented";
import { Chip } from "@/components/ui/chip";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const CURRENCIES: Currency[] = ["USD", "EUR", "GBP", "JPY", "AUD", "INR"];

const STYLE_OPTIONS: { value: TravelStyle; label: string }[] = [
  { value: "budget", label: "Budget" },
  { value: "comfort", label: "Comfort" },
  { value: "luxury", label: "Luxury" },
];

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun, hint: "Bright and airy" },
  { value: "dark", label: "Dark", icon: Moon, hint: "Deep navy night mode" },
  { value: "system", label: "System", icon: Desktop, hint: "Follows your device" },
];

export function SettingsClient() {
  const mounted = useHasMounted();
  const { theme, setTheme } = useTheme();
  const prefs = useAppStore((s) => s.prefs);
  const setPrefs = useAppStore((s) => s.setPrefs);
  const trips = useAppStore((s) => s.trips);
  const favorites = useAppStore((s) => s.favorites);
  const clearAll = useAppStore((s) => s.clearAll);

  const [clearOpen, setClearOpen] = React.useState(false);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-8">
        <PageHeader title="Profile & Settings" />
        <div className="mt-10 flex flex-col gap-6">
          <Skeleton className="h-44 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-44 rounded-3xl" />
        </div>
      </div>
    );
  }

  function exportData() {
    const data = JSON.stringify({ trips, favorites, prefs }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "meridian-trips.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-8">
      <PageHeader
        title="Profile & Settings"
        description="Everything stays on this device. Export whenever you like."
      />

      <div className="mt-10 flex flex-col gap-6">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle size={20} className="text-ocean" /> Profile
            </CardTitle>
            <CardDescription>Used to greet you and label exports. Nothing leaves the browser.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex max-w-sm flex-col gap-2">
              <Label htmlFor="pref-name">Name</Label>
              <Input
                id="pref-name"
                defaultValue={prefs.name}
                placeholder="What should we call you?"
                onBlur={(e) => setPrefs({ name: e.target.value.trim() })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Travel preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Travel preferences</CardTitle>
            <CardDescription>Defaults for new plans. You can always override per trip.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="pref-currency">Currency</Label>
                <Select value={prefs.currency} onValueChange={(v) => setPrefs({ currency: v as Currency })}>
                  <SelectTrigger id="pref-currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Units</Label>
                <Segmented
                  idPrefix="pref-units"
                  options={[
                    { value: "metric", label: "Metric" },
                    { value: "imperial", label: "Imperial" },
                  ]}
                  value={prefs.units}
                  onChange={(units) => setPrefs({ units })}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Default travel style</Label>
              <Segmented
                idPrefix="pref-style"
                options={STYLE_OPTIONS}
                value={prefs.defaultStyle}
                onChange={(defaultStyle) => setPrefs({ defaultStyle })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Default interests</Label>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map((opt) => (
                  <Chip
                    key={opt.value}
                    active={prefs.defaultInterests.includes(opt.value as Interest)}
                    onClick={() =>
                      setPrefs({
                        defaultInterests: prefs.defaultInterests.includes(opt.value as Interest)
                          ? prefs.defaultInterests.filter((i) => i !== opt.value)
                          : [...prefs.defaultInterests, opt.value as Interest],
                      })
                    }
                  >
                    {opt.label}
                  </Chip>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Both themes are first-class. System is the default.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Theme">
              {THEME_OPTIONS.map(({ value, label, icon: Icon, hint }) => {
                const active = theme === value;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setTheme(value)}
                    className={cn(
                      "focus-ring cursor-pointer rounded-2xl border p-4 text-left transition-all duration-200 active:scale-[0.98]",
                      active ? "border-ocean bg-ocean/10" : "border-line bg-raised hover:border-ocean/40"
                    )}
                  >
                    <Icon size={18} weight={active ? "fill" : "regular"} className={active ? "text-ocean" : "text-ink-muted"} />
                    <p className="mt-2 text-sm font-medium text-ink">{label}</p>
                    <p className="mt-0.5 text-xs text-ink-faint max-sm:hidden">{hint}</p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Data */}
        <Card>
          <CardHeader>
            <CardTitle>Your data</CardTitle>
            <CardDescription>
              {trips.length === 0
                ? "No trips saved yet."
                : `${trips.length} saved ${trips.length === 1 ? "trip" : "trips"} and ${favorites.length} favorite ${favorites.length === 1 ? "destination" : "destinations"}, stored locally.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={exportData}>
              <DownloadSimple size={15} /> Export JSON
            </Button>
            <Button variant="danger" className="bg-danger/10" onClick={() => setClearOpen(true)}>
              <Trash size={15} /> Clear everything
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={clearOpen} onOpenChange={setClearOpen}>
        <DialogContent>
          <DialogTitle>Clear all data?</DialogTitle>
          <DialogDescription>
            Trips, favorites, and chat history will be removed from this device. Your preferences stay. This cannot be undone.
          </DialogDescription>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setClearOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              className="bg-danger/10"
              onClick={() => {
                clearAll();
                setClearOpen(false);
              }}
            >
              Clear everything
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
