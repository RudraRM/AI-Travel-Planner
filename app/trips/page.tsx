import type { Metadata } from "next";
import { TripsClient } from "@/components/trips/trips-client";

export const metadata: Metadata = {
  title: "My Trips",
  description: "Every plan you've saved, ready to edit, duplicate, or pack for.",
};

export default function TripsPage() {
  return <TripsClient />;
}
