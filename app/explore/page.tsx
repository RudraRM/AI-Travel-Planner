import type { Metadata } from "next";
import { ExploreClient } from "@/components/explore/explore-client";

export const metadata: Metadata = {
  title: "Explore",
  description: "Browse destinations by budget, climate, trip length, and what you love doing.",
};

export default function ExplorePage() {
  return <ExploreClient />;
}
