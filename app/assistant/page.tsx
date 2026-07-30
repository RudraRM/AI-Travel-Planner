import type { Metadata } from "next";
import { AssistantClient } from "@/components/assistant/assistant-client";

export const metadata: Metadata = {
  title: "Travel Assistant",
  description: "Ask about visas, seasons, budgets, packing, and where to go next.",
};

export default function AssistantPage() {
  return <AssistantClient />;
}
