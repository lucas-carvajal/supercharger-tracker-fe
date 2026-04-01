"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Supercharger, SuperchargerStatus } from "@/lib/api";

const statusConfig: Record<
  SuperchargerStatus,
  { label: string; dot: string; badge: string }
> = {
  IN_DEVELOPMENT: {
    label: "In Development",
    dot: "bg-amber-400",
    badge: "border-amber-400/20 bg-amber-400/10 text-amber-400",
  },
  UNDER_CONSTRUCTION: {
    label: "Under Construction",
    dot: "bg-sky-400",
    badge: "border-sky-400/20 bg-sky-400/10 text-sky-400",
  },
  UNKNOWN: {
    label: "Unknown",
    dot: "bg-zinc-500",
    badge: "border-zinc-500/20 bg-zinc-500/10 text-zinc-400",
  },
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export function SuperchargerCard({
  supercharger,
}: {
  supercharger: Supercharger;
}) {
  const { label, dot, badge } =
    statusConfig[supercharger.status] ?? statusConfig.UNKNOWN;

  const [sparkKey, setSparkKey] = useState<number | null>(null);

  return (
    <div
      className="animate-card-enter relative flex cursor-pointer flex-col rounded-xl border border-border bg-card p-5 transition-all active:scale-95 hover:-translate-y-0.5 hover:border-foreground/15 hover:bg-foreground/[0.02] hover:shadow-md"
      onClick={() => setSparkKey(Date.now())}
    >
      {sparkKey !== null && (
        <span
          key={sparkKey}
          className="animate-spark pointer-events-none absolute left-1/2 top-1/2 select-none text-2xl"
          onAnimationEnd={() => setSparkKey(null)}
        >
          ⚡
        </span>
      )}
      <span
        className={cn(
          "mb-4 inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
          badge
        )}
      >
        <span className={cn("size-1.5 rounded-full", dot)} />
        {label}
      </span>
      <h2 className="text-sm font-semibold leading-snug text-foreground">
        {supercharger.title}
      </h2>
      <div className="mt-auto flex items-center justify-between pt-4">
        <p className="text-xs text-muted-foreground">
          {formatDate(supercharger.first_seen_at)}
        </p>
        <a
          href={supercharger.tesla_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          onClick={(e) => e.stopPropagation()}
        >
          Tesla.com →
        </a>
      </div>
    </div>
  );
}
