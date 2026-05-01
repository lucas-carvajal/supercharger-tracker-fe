"use client";

import { useState } from "react";
import type { Supercharger, SuperchargerStatus } from "@/lib/api";
import { SuperchargerCard } from "@/components/SuperchargerCard";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { OverlayNotice } from "@/components/ui/overlay-notice";

const LIMIT = 30;
const SKELETON_COUNT = 9;

type FilterStatus = SuperchargerStatus | null;
type LoadingMode = "idle" | "replacing" | "appending";

const REGION_GROUPS: { label: string; options: { label: string; value: string }[] }[] = [
  {
    label: "North America",
    options: [
      { label: "United States", value: "US" },
      { label: "Canada", value: "Canada" },
      { label: "Mexico", value: "Mexico" },
    ],
  },
  {
    label: "Europe",
    options: [
      { label: "United Kingdom", value: "United Kingdom" },
      { label: "Germany", value: "Germany" },
      { label: "France", value: "France" },
      { label: "Spain", value: "Spain" },
      { label: "Norway", value: "Norway" },
      { label: "Sweden", value: "Sweden" },
      { label: "Italy", value: "Italy" },
      { label: "Finland", value: "Finland" },
      { label: "Denmark", value: "Denmark" },
      { label: "Netherlands", value: "Netherlands" },
      { label: "Switzerland", value: "Switzerland" },
      { label: "Austria", value: "Austria" },
      { label: "Poland", value: "Poland" },
      { label: "Portugal", value: "Portugal" },
      { label: "Czech Republic", value: "Czech Republic" },
      { label: "Hungary", value: "Hungary" },
      { label: "Romania", value: "Romania" },
      { label: "Croatia", value: "Croatia" },
      { label: "Slovenia", value: "Slovenia" },
      { label: "Slovakia", value: "Slovakia" },
      { label: "Latvia", value: "Latvia" },
      { label: "Iceland", value: "Iceland" },
      { label: "Ireland", value: "Ireland" },
    ],
  },
  {
    label: "Asia Pacific",
    options: [
      { label: "Australia", value: "Australia" },
      { label: "New Zealand", value: "New Zealand" },
      { label: "Japan", value: "Japan" },
      { label: "South Korea", value: "South Korea" },
      { label: "Taiwan", value: "Taiwan" },
      { label: "Thailand", value: "Thailand" },
    ],
  },
  {
    label: "Middle East & Africa",
    options: [
      { label: "UAE", value: "UAE" },
      { label: "Turkey", value: "Turkey" },
      { label: "Israel", value: "Israel" },
      { label: "Saudi Arabia", value: "Saudi Arabia" },
      { label: "Morocco", value: "Morocco" },
    ],
  },
  {
    label: "Latin America",
    options: [
      { label: "Chile", value: "Chile" },
      { label: "Colombia", value: "Colombia" },
    ],
  },
];

function FilterSelect({
  value,
  onChange,
  disabled,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex-1 sm:flex-none">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full appearance-none cursor-pointer bg-transparent py-3 pl-4 pr-8 text-sm text-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-2.5"
      >
        {children}
      </select>
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
        ▾
      </span>
    </div>
  );
}

function SuperchargerCardSkeleton() {
  return (
    <GlassCard className="flex flex-col">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="h-5 w-40 animate-pulse rounded-md bg-white/10" />
        <div className="h-5 w-28 animate-pulse rounded-full bg-white/10" />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
        <div className="h-3 w-28 animate-pulse rounded bg-white/10" />
      </div>
    </GlassCard>
  );
}

interface SuperchargerListProps {
  initialItems: Supercharger[];
  initialTotal: number;
  initialError?: boolean;
}

export function SuperchargerList({
  initialItems,
  initialTotal,
  initialError = false,
}: SuperchargerListProps) {
  const [items, setItems] = useState(initialItems);
  const [total, setTotal] = useState(initialTotal);
  const [offset, setOffset] = useState(initialItems.length);
  const [activeStatus, setActiveStatus] = useState<FilterStatus>(null);
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [loadingMode, setLoadingMode] = useState<LoadingMode>("idle");
  const [loadError, setLoadError] = useState(initialError);

  async function fetchItems(
    status: FilterStatus,
    region: string | null,
    currentOffset: number,
    replace: boolean
  ) {
    setLoadingMode(replace ? "replacing" : "appending");
    try {
      setLoadError(false);
      const params = new URLSearchParams({
        limit: String(LIMIT),
        offset: String(currentOffset),
      });
      if (status) params.set("status", status);
      if (region) params.set("region", region);

      const res = await fetch(`/api/superchargers/soon?${params}`);
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
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
    } catch {
      setLoadError(true);
    } finally {
      setLoadingMode("idle");
    }
  }

  function handleStatusChange(value: string) {
    const status = (value || null) as FilterStatus;
    if (status === activeStatus) return;
    setActiveStatus(status);
    fetchItems(status, activeRegion, 0, true);
  }

  function handleRegionChange(value: string) {
    const region = value || null;
    if (region === activeRegion) return;
    setActiveRegion(region);
    fetchItems(activeStatus, region, 0, true);
  }

  function handleShowMore() {
    fetchItems(activeStatus, activeRegion, offset, false);
  }

  const isLoading = loadingMode !== "idle";

  return (
    <div>
      {loadError && (
        <OverlayNotice
          title="Supercharger data unavailable"
          message="We're having trouble loading supercharger data right now. Please try again later."
        />
      )}

      {/* Filters */}
      <div className="mb-8 flex justify-center">
        <div className="flex w-full items-center overflow-hidden rounded-2xl border border-white/15 bg-background/90 shadow-2xl backdrop-blur-xl sm:w-auto">
          <FilterSelect
            value={activeStatus ?? ""}
            onChange={handleStatusChange}
            disabled={isLoading}
          >
            <option value="">All Statuses</option>
            <option value="IN_DEVELOPMENT">In Development</option>
            <option value="UNDER_CONSTRUCTION">Under Construction</option>
          </FilterSelect>
          <div className="h-5 w-px shrink-0 bg-border/60" />
          <FilterSelect
            value={activeRegion ?? ""}
            onChange={handleRegionChange}
            disabled={isLoading}
          >
            <option value="">All Regions</option>
            {REGION_GROUPS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </FilterSelect>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2 lg:grid-cols-3">
        {loadingMode === "replacing"
          ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <SuperchargerCardSkeleton key={i} />
            ))
          : items.map((sc) => (
              <SuperchargerCard key={sc.id} supercharger={sc} />
            ))}
      </div>

      {/* Show more */}
      {loadingMode !== "replacing" && offset < total && (
        <div className="mt-10 flex justify-center">
          <Button
            variant="outline"
            className="w-full rounded-full px-8 sm:w-auto"
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
