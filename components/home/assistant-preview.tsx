"use client";

import Link from "next/link";
import { ChatCircleDots, ArrowRight } from "@phosphor-icons/react";
import { Reveal } from "@/components/motion/reveal";

const EXCHANGE = [
  {
    role: "user" as const,
    text: "Do I need a visa for Vietnam?",
  },
  {
    role: "assistant" as const,
    text: "Hanoi, Vietnam: e-visa available online for most nationalities, up to 90 days. Rules shift, so confirm with the official source before booking.",
  },
  {
    role: "user" as const,
    text: "And when's the best time to go?",
  },
  {
    role: "assistant" as const,
    text: "The sweet spot is October to December, and again March to April. Most people find 3 to 6 days about right.",
  },
];

export function AssistantPreview() {
  return (
    <section className="mx-auto max-w-3xl px-4 pb-24 md:px-8">
      <Reveal className="mb-8 text-center">
        <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          A concierge that knows your trips
        </h2>
        <p className="mx-auto mt-2 max-w-md text-[15px] text-ink-muted">
          Visas, seasons, swaps, and second opinions. Ask mid-plan or mid-flight.
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="glass rounded-3xl p-6">
          <div className="flex flex-col gap-3">
            {EXCHANGE.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <p
                  className={
                    m.role === "user"
                      ? "max-w-[80%] rounded-3xl rounded-br-lg bg-ocean-strong px-4 py-2.5 text-sm text-white"
                      : "max-w-[80%] rounded-3xl rounded-bl-lg bg-raised px-4 py-2.5 text-sm text-ink border border-line"
                  }
                >
                  {m.text}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-center">
            <Link
              href="/assistant"
              className="focus-ring flex items-center gap-1.5 rounded-full text-sm font-medium text-ocean-strong transition-colors hover:text-ocean-deep dark:text-sky-soft"
            >
              <ChatCircleDots size={16} weight="fill" /> Ask the assistant <ArrowRight size={14} weight="bold" />
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
