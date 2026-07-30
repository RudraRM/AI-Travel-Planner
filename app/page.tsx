import { Hero } from "@/components/home/hero";
import { DestinationRail } from "@/components/home/destination-rail";
import { FeatureBento } from "@/components/home/feature-bento";
import { AssistantPreview } from "@/components/home/assistant-preview";
import { ClosingCta } from "@/components/home/closing-cta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <DestinationRail />
      <FeatureBento />
      <AssistantPreview />
      <ClosingCta />
    </>
  );
}
