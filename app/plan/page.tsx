import { Suspense } from "react";
import type { Metadata } from "next";
import { PlanClient } from "@/components/plan/plan-client";

export const metadata: Metadata = {
  title: "Plan Trip",
  description: "Describe the trip in a sentence and get a full day-by-day plan.",
};

export default function PlanPage() {
  return (
    <Suspense>
      <PlanClient />
    </Suspense>
  );
}
