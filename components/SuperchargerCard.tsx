"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Supercharger } from "@/lib/api";
import { STATUS_CONFIG } from "@/lib/status";
import { GlassCard } from "@/components/ui/glass-card";

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
    STATUS_CONFIG[supercharger.status] ?? STATUS_CONFIG.UNKNOWN;

  const [sparks, setSparks] = useState<number[]>([]);

  return (
    <GlassCard
      className="animate-card-enter relative flex cursor-pointer flex-col transition-all active:scale-95 hover:bg-white/[0.08] hover:border-white/[0.15] hover:shadow-lg [@media(hover:hover)]:hover:scale-[1.03]"
      onClick={() => setSparks((prev) => [...prev, Date.now()])}
    >
      {sparks.map((key) => (
        <span
          key={key}
          className="animate-spark pointer-events-none absolute left-1/2 top-1/2 select-none text-2xl"
          onAnimationEnd={() => setSparks((prev) => prev.filter((k) => k !== key))}
        >
          ⚡
        </span>
      ))}
      <div className="mb-4 flex items-start justify-between gap-3">
        <h2 className="text-base font-semibold leading-snug text-foreground">
          {supercharger.title}
        </h2>
        <span
          className={cn(
            "shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
            badge
          )}
        >
          <span className={cn("size-1.5 rounded-full", dot)} />
          {label}
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          First seen {formatDate(supercharger.first_seen_at)}
        </p>
        <a
          href={supercharger.tesla_url}
          target="_blank"
          rel="noopener noreferrer"
          className="-mr-1 -my-2 py-2 pr-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          onClick={(e) => e.stopPropagation()}
        >
          View on Tesla.com →
        </a>
      </div>
    </GlassCard>
  );
}
