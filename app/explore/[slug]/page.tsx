import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { destinations, getDestination } from "@/lib/data/destinations";
import { DestinationDetail } from "@/components/explore/destination-detail";

export function generateStaticParams() {
  return destinations.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const dest = getDestination(slug);
  if (!dest) return { title: "Destination" };
  return {
    title: `${dest.name}, ${dest.country}`,
    description: dest.summary,
  };
}

export default async function DestinationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dest = getDestination(slug);
  if (!dest) notFound();
  return <DestinationDetail dest={dest} />;
}
