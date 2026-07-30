"use client";

import { motion, useReducedMotion } from "framer-motion";
import { destinations } from "@/lib/data/destinations";
import { PromptBox } from "@/components/travel/prompt-box";
import { DestinationCard } from "@/components/travel/destination-card";
import { FlightPath } from "@/components/travel/flight-path";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const reduce = useReducedMotion();
  const featured = destinations.find((d) => d.slug === "santorini")!;

  return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-10 md:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:pt-20">
      <div>
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl lg:text-6xl"
        >
          Every trip starts
          <br />
          with a sentence.
        </motion.h1>
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
          className="mt-5 max-w-md text-base text-ink-muted md:text-lg"
        >
          Tell Meridian where and how you travel. It drafts the days, prices the budget, and packs the bag.
        </motion.p>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
          className="mt-8"
        >
          <PromptBox />
        </motion.div>
      </div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.25, ease: EASE }}
        className="relative hidden lg:block"
      >
        <div className="relative mx-auto max-w-sm rotate-1 transition-transform duration-500 hover:rotate-0">
          <DestinationCard dest={featured} />
          <div className="glass absolute -left-16 -top-10 rounded-3xl px-5 py-4 text-ocean">
            <FlightPath className="w-40" />
            <p className="mt-1 text-xs font-medium text-ink-muted">Door to door, planned in seconds</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
