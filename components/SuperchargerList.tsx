"use client";

import { useState } from "react";
import type { Supercharger, SuperchargerStatus, StatsResponse } from "@/lib/api";
import { SuperchargerCard } from "@/components/SuperchargerCard";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";

const LIMIT = 30;
const SKELETON_COUNT = 9;

type FilterStatus = SuperchargerStatus | null;
type LoadingMode = "idle" | "replacing" | "appending";

const FILTERS: { label: string; value: FilterStatus }[] = [
  { label: "All", value: null },
  { label: "In Development", value: "IN_DEVELOPMENT" },
  { label: "Under Construction", value: "UNDER_CONSTRUCTION" },
];

function SuperchargerCardSkeleton() {
  return (
    <GlassCard className="flex flex-col">
      <div className="mb-4 h-5 w-28 animate-pulse rounded-full bg-white/10" />
      <div className="h-4 w-full animate-pulse rounded-md bg-white/10" />
      <div className="mt-1.5 h-4 w-2/3 animate-pulse rounded-md bg-white/10" />
      <div className="mt-auto flex items-center justify-between pt-4">
        <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
        <div className="h-3 w-16 animate-pulse rounded bg-white/10" />
      </div>
    </GlassCard>
  );
}

interface SuperchargerListProps {
  initialItems: Supercharger[];
  initialTotal: number;
  stats: StatsResponse | null;
}

export function SuperchargerList({
  initialItems,
  initialTotal,
  stats,
}: SuperchargerListProps) {
  const [items, setItems] = useState(initialItems);
  const [total, setTotal] = useState(initialTotal);
  const [offset, setOffset] = useState(initialItems.length);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>(null);
  const [loadingMode, setLoadingMode] = useState<LoadingMode>("idle");

  async function fetchItems(
    status: FilterStatus,
    currentOffset: number,
    replace: boolean
  ) {
    setLoadingMode(replace ? "replacing" : "appending");
    try {
      const params = new URLSearchParams({
        limit: String(LIMIT),
        offset: String(currentOffset),
      });
      if (status) params.set("status", status);

      const res = await fetch(`/api/superchargers/soon?${params}`);
      const data = await res.json();

      if (replace) {
        const seen = new Set<string>();
        const deduped = (data.items as Supercharger[]).filter((item) =>
          seen.has(item.id) ? false : seen.add(item.id)
        );
        setItems(deduped);
        setOffset(deduped.length);
      } else {
        setItems((prev) => {
          const seen = new Set(prev.map((item) => item.id));
          const incoming = (data.items as Supercharger[]).filter(
            (item) => !seen.has(item.id)
          );
          return [...prev, ...incoming];
        });
        setOffset((prev) => prev + data.items.length);
      }
      setTotal(data.total);
    } finally {
      setLoadingMode("idle");
    }
  }

  function handleFilterChange(status: FilterStatus) {
    if (status === activeFilter) return;
    setActiveFilter(status);
    fetchItems(status, 0, true);
  }

  function handleShowMore() {
    fetchItems(activeFilter, offset, false);
  }

  const isLoading = loadingMode !== "idle";

  return (
    <div>
      {/* Sticky filter bar */}
      <div className="sticky top-0 z-10 -mx-4 mb-8 border-b border-border/30 bg-background/80 px-4 py-3 backdrop-blur-md sm:-mx-8 sm:px-8">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(({ label, value }) => {
            const count =
              value === null
                ? (stats?.total_active ?? 0)
                : (stats?.by_status[value] ?? 0);
            return (
              <Button
                key={label}
                variant={activeFilter === value ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => handleFilterChange(value)}
                disabled={isLoading}
              >
                {label}
                <span className="ml-1.5 tabular-nums opacity-60">
                  {count.toLocaleString()}
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {loadingMode === "replacing"
          ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <SuperchargerCardSkeleton key={i} />
            ))
          : items.map((sc) => (
              <SuperchargerCard key={sc.id} supercharger={sc} />
            ))}
      </div>

      {/* Show more */}
      {loadingMode !== "replacing" && items.length < total && (
        <div className="mt-10 flex justify-center">
          <Button
            variant="outline"
            className="rounded-full px-8"
            onClick={handleShowMore}
            disabled={isLoading}
          >
            {loadingMode === "appending" ? "Loading…" : "Show more"}
          </Button>
        </div>
      )}
    </div>
  );
}
