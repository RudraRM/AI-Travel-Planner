import type { Metadata } from "next";
import { SettingsClient } from "@/components/settings/settings-client";

export const metadata: Metadata = {
  title: "Profile & Settings",
  description: "Your name, preferences, appearance, and data.",
};

export default function SettingsPage() {
  return <SettingsClient />;
}
