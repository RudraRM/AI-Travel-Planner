"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Activity, ChatMessage, DayPlan, Interest, PackingItem, Trip, TravelStyle } from "@/lib/types";
import type { Currency } from "@/lib/format";
import { uid } from "@/lib/utils";

export interface Preferences {
  name: string;
  currency: Currency;
  defaultStyle: TravelStyle;
  defaultInterests: Interest[];
  units: "metric" | "imperial";
}

interface AppState {
  trips: Trip[];
  favorites: string[];
  recentlyViewed: string[];
  chat: ChatMessage[];
  prefs: Preferences;

  addTrip: (trip: Trip) => void;
  updateTrip: (id: string, patch: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  duplicateTrip: (id: string) => string | undefined;

  setItinerary: (tripId: string, itinerary: DayPlan[]) => void;
  reorderDay: (tripId: string, dayId: string, activities: Activity[]) => void;
  upsertActivity: (tripId: string, dayId: string, activity: Activity) => void;
  removeActivity: (tripId: string, dayId: string, activityId: string) => void;

  togglePacking: (tripId: string, itemId: string) => void;
  addPackingItem: (tripId: string, item: Omit<PackingItem, "id" | "checked">) => void;
  removePackingItem: (tripId: string, itemId: string) => void;
  resetPacking: (tripId: string) => void;

  toggleFavorite: (slug: string) => void;
  pushRecent: (slug: string) => void;

  pushChat: (message: Pick<ChatMessage, "role" | "content">) => void;
  clearChat: () => void;

  setPrefs: (patch: Partial<Preferences>) => void;
  clearAll: () => void;
}

const touch = (t: Trip): Trip => ({ ...t, updatedAt: Date.now() });

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      trips: [],
      favorites: [],
      recentlyViewed: [],
      chat: [],
      prefs: {
        name: "",
        currency: "USD",
        defaultStyle: "comfort",
        defaultInterests: ["culture", "food"],
        units: "metric",
      },

      addTrip: (trip) => set((s) => ({ trips: [trip, ...s.trips] })),

      updateTrip: (id, patch) =>
        set((s) => ({
          trips: s.trips.map((t) => (t.id === id ? touch({ ...t, ...patch }) : t)),
        })),

      deleteTrip: (id) => set((s) => ({ trips: s.trips.filter((t) => t.id !== id) })),

      duplicateTrip: (id) => {
        const source = get().trips.find((t) => t.id === id);
        if (!source) return undefined;
        const copyId = uid("trip");
        const copy: Trip = {
          ...structuredClone(source),
          id: copyId,
          title: `${source.title} (copy)`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((s) => ({ trips: [copy, ...s.trips] }));
        return copyId;
      },

      setItinerary: (tripId, itinerary) =>
        set((s) => ({
          trips: s.trips.map((t) => (t.id === tripId ? touch({ ...t, itinerary }) : t)),
        })),

      reorderDay: (tripId, dayId, activities) =>
        set((s) => ({
          trips: s.trips.map((t) =>
            t.id === tripId
              ? touch({
                  ...t,
                  itinerary: t.itinerary.map((d) => (d.id === dayId ? { ...d, activities } : d)),
                })
              : t
          ),
        })),

      upsertActivity: (tripId, dayId, activity) =>
        set((s) => ({
          trips: s.trips.map((t) => {
            if (t.id !== tripId) return t;
            return touch({
              ...t,
              itinerary: t.itinerary.map((d) => {
                if (d.id !== dayId) return d;
                const exists = d.activities.some((a) => a.id === activity.id);
                return {
                  ...d,
                  activities: exists
                    ? d.activities.map((a) => (a.id === activity.id ? activity : a))
                    : [...d.activities, activity],
                };
              }),
            });
          }),
        })),

      removeActivity: (tripId, dayId, activityId) =>
        set((s) => ({
          trips: s.trips.map((t) =>
            t.id === tripId
              ? touch({
                  ...t,
                  itinerary: t.itinerary.map((d) =>
                    d.id === dayId ? { ...d, activities: d.activities.filter((a) => a.id !== activityId) } : d
                  ),
                })
              : t
          ),
        })),

      togglePacking: (tripId, itemId) =>
        set((s) => ({
          trips: s.trips.map((t) =>
            t.id === tripId
              ? {
                  ...t,
                  packing: t.packing.map((p) => (p.id === itemId ? { ...p, checked: !p.checked } : p)),
                }
              : t
          ),
        })),

      addPackingItem: (tripId, item) =>
        set((s) => ({
          trips: s.trips.map((t) =>
            t.id === tripId
              ? { ...t, packing: [...t.packing, { ...item, id: uid("pack"), checked: false }] }
              : t
          ),
        })),

      removePackingItem: (tripId, itemId) =>
        set((s) => ({
          trips: s.trips.map((t) =>
            t.id === tripId ? { ...t, packing: t.packing.filter((p) => p.id !== itemId) } : t
          ),
        })),

      resetPacking: (tripId) =>
        set((s) => ({
          trips: s.trips.map((t) =>
            t.id === tripId ? { ...t, packing: t.packing.map((p) => ({ ...p, checked: false })) } : t
          ),
        })),

      toggleFavorite: (slug) =>
        set((s) => ({
          favorites: s.favorites.includes(slug)
            ? s.favorites.filter((f) => f !== slug)
            : [slug, ...s.favorites],
        })),

      pushRecent: (slug) =>
        set((s) => ({
          recentlyViewed: [slug, ...s.recentlyViewed.filter((r) => r !== slug)].slice(0, 8),
        })),

      pushChat: (message) =>
        set((s) => ({
          chat: [...s.chat, { ...message, id: uid("msg"), createdAt: Date.now() }],
        })),
      clearChat: () => set({ chat: [] }),

      setPrefs: (patch) => set((s) => ({ prefs: { ...s.prefs, ...patch } })),

      clearAll: () =>
        set({
          trips: [],
          favorites: [],
          recentlyViewed: [],
          chat: [],
        }),
    }),
    { name: "meridian-store" }
  )
);

/** Gate client-persisted reads behind mount to avoid hydration mismatch. */
const emptySubscribe = () => () => {};
export function useHasMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
