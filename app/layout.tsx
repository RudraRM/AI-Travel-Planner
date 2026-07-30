import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/shell/providers";
import { AppShell } from "@/components/shell/app-shell";
import { AmbientBackground } from "@/components/motion/ambient";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Meridian, your AI travel concierge",
    template: "%s · Meridian",
  },
  description:
    "Describe the trip in a sentence. Meridian drafts the itinerary, prices the budget, and packs the bag.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <Providers>
          <AmbientBackground />
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
