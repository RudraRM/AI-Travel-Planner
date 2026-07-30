import type { Metadata } from "next";
import { BudgetClient } from "@/components/budget/budget-client";

export const metadata: Metadata = {
  title: "Budget",
  description: "Estimate flights, stays, food, and activities before you commit.",
};

export default function BudgetPage() {
  return <BudgetClient />;
}
