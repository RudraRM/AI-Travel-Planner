"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Slow-drifting background gradients. Fixed, non-interactive, GPU-only
 * transforms; collapses to a static wash under reduced motion.
 */
export function AmbientBackground() {
  const reduce = useReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute -top-40 left-[8%] size-[34rem] rounded-full bg-gradient-to-br from-ocean/20 to-mint/10 blur-3xl dark:from-ocean/15 dark:to-emerald-brand/5"
        animate={reduce ? undefined : { x: [0, 40, 0], y: [0, 24, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[4%] top-1/3 size-[28rem] rounded-full bg-gradient-to-br from-sky-soft/15 to-sun/10 blur-3xl dark:from-sky-soft/10 dark:to-sunset/5"
        animate={reduce ? undefined : { x: [0, -32, 0], y: [0, 36, 0] }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-48 left-1/3 size-[30rem] rounded-full bg-gradient-to-tr from-ocean/10 to-sunset/10 blur-3xl dark:from-ocean/10 dark:to-sunset/5"
        animate={reduce ? undefined : { x: [0, 24, 0], y: [0, -28, 0] }}
        transition={{ duration: 29, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
