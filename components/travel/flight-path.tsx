"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Decorative dashed flight arc, drawn on scroll into view.
 * Explicitly called for by the brief's map-and-flight-path motif.
 */
export function FlightPath({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <svg viewBox="0 0 400 120" fill="none" aria-hidden className={className}>
      <motion.path
        d="M12 104 C 100 10, 290 6, 388 78"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="1 10"
        initial={reduce ? undefined : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1.6, ease: "easeInOut" }}
      />
      <circle cx="12" cy="104" r="4" fill="currentColor" opacity="0.5" />
      <circle cx="388" cy="78" r="4" fill="currentColor" />
    </svg>
  );
}
