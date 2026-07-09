"use client";

import { useEffect, useState } from "react";

/** Count rate: +1 on the displayed value every 2 milliseconds. */
const COUNT_PER_MS = 0.5;

/**
 * Survives client-side navigations (module stays in memory) but resets on
 * full page load / reload (module is re-evaluated). Used so the count-up
 * only plays on the first visit of a document lifetime.
 */
let hasPlayedCountUp = false;

type CountUpStatProps = {
  value: number | null;
  label: string;
  title?: string;
};

export function CountUpStat({ value, label, title }: CountUpStatProps) {
  const [display, setDisplay] = useState(() =>
    hasPlayedCountUp && value !== null ? value : 0,
  );

  useEffect(() => {
    if (value === null) return;

    if (hasPlayedCountUp) {
      // Already played this document lifetime (e.g. navigated back) — show final.
      const frame = requestAnimationFrame(() => setDisplay(value));
      return () => cancelAnimationFrame(frame);
    }

    let frame = 0;
    let start: number | null = null;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      frame = requestAnimationFrame(() => setDisplay(value));
      return () => {
        cancelAnimationFrame(frame);
        // Defer so React Strict Mode's sync remount still sees the flag as false.
        queueMicrotask(() => {
          hasPlayedCountUp = true;
        });
      };
    }

    const tick = (now: number) => {
      if (start === null) start = now;
      const next = Math.min(Math.floor((now - start) * COUNT_PER_MS), value);
      setDisplay(next);
      if (next < value) {
        frame = requestAnimationFrame(tick);
      } else {
        hasPlayedCountUp = true;
      }
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      // Mark played when leaving the page so a client back-nav skips the animation.
      // Microtask defers past React Strict Mode's immediate unmount/remount cycle.
      queueMicrotask(() => {
        hasPlayedCountUp = true;
      });
    };
  }, [value]);

  return (
    <div className="flex flex-col items-center" title={title}>
      <span className="text-2xl font-bold tabular-nums text-foreground sm:text-4xl">
        {value === null ? "—" : display}
      </span>
      <span className="mt-1 text-xs text-muted-foreground sm:text-sm">
        {label}
      </span>
    </div>
  );
}
