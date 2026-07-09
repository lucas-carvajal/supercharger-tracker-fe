"use client";

import { useEffect, useState } from "react";

/** Count rate: +1 on the displayed value every 2 milliseconds. */
const COUNT_PER_MS = 0.5;

type CountUpStatProps = {
  value: number | null;
  label: string;
  title?: string;
};

export function CountUpStat({ value, label, title }: CountUpStatProps) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === null) return;

    let frame = 0;
    let start: number | null = null;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      frame = requestAnimationFrame(() => setDisplay(value));
      return () => cancelAnimationFrame(frame);
    }

    const tick = (now: number) => {
      if (start === null) start = now;
      const next = Math.min(Math.floor((now - start) * COUNT_PER_MS), value);
      setDisplay(next);
      if (next < value) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
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
