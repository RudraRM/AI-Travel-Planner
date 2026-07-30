"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { Reveal } from "@/components/motion/reveal";
import { FlightPath } from "@/components/travel/flight-path";

export function ClosingCta() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-24 md:px-8">
      <Reveal>
        <div className="dot-grid relative overflow-hidden rounded-3xl bg-navy px-8 py-16 text-center text-white md:py-20">
          <FlightPath className="pointer-events-none absolute -top-4 left-1/2 w-[28rem] max-w-full -translate-x-1/2 text-sky-soft/40" />
          <h2 className="font-display relative text-3xl font-bold tracking-tight md:text-4xl">
            The planning is the easy part now.
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-[15px] text-white/70">
            One sentence in, a full trip out. Edit everything, save it, take it with you.
          </p>
          <div className="relative mt-8 flex justify-center">
            <Link
              href="/plan"
              className="focus-ring flex h-12 items-center gap-2 rounded-full bg-ocean-strong px-7 text-[15px] font-medium text-white shadow-[0_8px_24px_-8px_rgb(14_165_233_/_0.8)] transition-all hover:bg-sky-soft hover:text-navy active:scale-[0.98]"
            >
              Start planning <ArrowRight size={17} weight="bold" />
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
