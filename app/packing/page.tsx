import type { Metadata } from "next";
import { PackingClient } from "@/components/packing/packing-client";

export const metadata: Metadata = {
  title: "Packing List",
  description: "Checklists generated from your destination's climate and your plans.",
};

export default function PackingPage() {
  return <PackingClient />;
}
