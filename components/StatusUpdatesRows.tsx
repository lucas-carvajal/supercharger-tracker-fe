"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { RecentUpdateItem, SuperchargerStatus } from "@/lib/api";
import { RecentUpdatesResponseSchema } from "@/lib/contracts/recent-updates";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { OverlayNotice } from "@/components/ui/overlay-notice";
import { StatusBadge } from "@/components/StatusBadge";
import { formatUtcDateShort } from "@/lib/date-display";
import { transitionDisplayText } from "@/lib/supercharger-history-status";

const LIMIT = 20;
const MAX_EXTRA_BATCHES = 2;

const REMOVE_EMOJI = "😢";

function FloatingSadEmoji({
  emojiId,
  onAnimationEnd,
}: {
  emojiId: number;
  onAnimationEnd: (id: number) => void;
}) {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      const t = window.setTimeout(() => onAnimationEnd(emojiId), 450);
      return () => window.clearTimeout(t);
    }
  }, [emojiId, onAnimationEnd]);

  return (
    <span
      key={emojiId}
      className="pointer-events-none absolute left-1/2 top-[45%] -translate-x-1/2 status-update-float text-3xl"
      aria-hidden
      onAnimationEnd={() => onAnimationEnd(emojiId)}
    >
      {REMOVE_EMOJI}
    </span>
  );
}

interface StatusUpdatesRowsProps {
  initialUpdates: RecentUpdateItem[];
  initialTotal: number;
}

function updateKey(update: RecentUpdateItem) {
  return `${update.id}-${update.changed_at}`;
}

export function StatusUpdatesRows({
  initialUpdates,
  initialTotal,
}: StatusUpdatesRowsProps) {
  const [updates, setUpdates] = useState(initialUpdates);
  const [total, setTotal] = useState(initialTotal);
  const [offset, setOffset] = useState(initialUpdates.length);
  const [extraBatches, setExtraBatches] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const canLoadMore = extraBatches < MAX_EXTRA_BATCHES && offset < total;

  async function handleLoadMore() {
    if (loading || !canLoadMore) return;
    setLoading(true);
    try {
      setLoadError(false);
      const params = new URLSearchParams({
        limit: String(LIMIT),
        offset: String(offset),
      });
      const res = await fetch(
        `/api/superchargers/soon/recent-updates?${params}`,
      );
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const json: unknown = await res.json();
      const data = RecentUpdatesResponseSchema.parse(json);

      setUpdates((prev) => {
        const seen = new Set(prev.map(updateKey));
        const incoming = data.items.filter((item) => !seen.has(updateKey(item)));
        return [...prev, ...incoming];
      });
      setOffset((prev) => prev + data.items.length);
      setTotal(data.total);
      setExtraBatches((n) => n + 1);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {loadError && (
        <OverlayNotice
          title="Could not load more updates"
          message="We're having trouble loading more status updates right now. Please try again later."
        />
      )}
      <ul className="grid list-none gap-4 p-0">
        {updates.map((update) => (
          <li key={updateKey(update)}>
            <StatusUpdateRow update={update} />
          </li>
        ))}
      </ul>
      {canLoadMore && (
        <div className="mt-10 flex justify-center">
          <Button
            variant="outline"
            className="w-full rounded-full px-8 sm:w-auto"
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? "Loading…" : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}

function StatusTransitionBadges({
  oldStatus,
  newStatus,
  transitionLabel,
}: {
  oldStatus: SuperchargerStatus | null;
  newStatus: SuperchargerStatus;
  transitionLabel: string;
}) {
  const showFrom = oldStatus !== null && oldStatus !== "UNKNOWN";

  return (
    <div
      role="group"
      aria-label={transitionLabel}
      className="flex flex-wrap items-center gap-2 text-left"
    >
      {showFrom ? (
        <>
          <StatusBadge status={oldStatus} size="sm" />
          <span className="text-muted-foreground" aria-hidden>
            →
          </span>
        </>
      ) : (
        <span className="text-muted-foreground" aria-hidden>
          →
        </span>
      )}
      <StatusBadge status={newStatus} size="sm" />
    </div>
  );
}

function StatusUpdateRow({ update }: { update: RecentUpdateItem }) {
  const title = update.title.trim() ? update.title.trim() : "Unnamed location";
  const transitionLabel = transitionDisplayText({
    old_status: update.old_status,
    new_status: update.new_status,
  });
  const dateDisplay = formatUtcDateShort(update.changed_at);

  const emojiKeyRef = useRef(0);
  const [emojiIds, setEmojiIds] = useState<number[]>([]);

  const popEmojiDone = useCallback((id: number) => {
    setEmojiIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const handleRemovedTap = () => {
    emojiKeyRef.current += 1;
    setEmojiIds((prev) => [...prev, emojiKeyRef.current]);
  };

  const body = (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-base font-semibold leading-snug text-foreground">
          {title}
        </h2>
        {update.new_status === "OPENED" ? (
          <ExternalLink
            className="size-3.5 shrink-0 text-muted-foreground"
            aria-hidden
          />
        ) : null}
      </div>
      <StatusTransitionBadges
        oldStatus={update.old_status}
        newStatus={update.new_status}
        transitionLabel={transitionLabel}
      />
      <time
        dateTime={update.changed_at.slice(0, 10)}
        className="text-xs tabular-nums text-muted-foreground"
      >
        {dateDisplay}
      </time>
    </div>
  );

  if (update.new_status === "OPENED") {
    return (
      <GlassCard className="p-5 shadow-none">
        <a
          href={`https://www.tesla.com/findus?location=${encodeURIComponent(update.id)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-2xl outline-none transition-colors active:opacity-95 focus-visible:ring-2 focus-visible:ring-primary/35"
        >
          {body}
        </a>
      </GlassCard>
    );
  }

  if (update.new_status === "REMOVED") {
    return (
      <GlassCard
        className={cn(
          "relative overflow-visible p-5 shadow-none",
          // Match link-row affordances on /status-updates (hover, press on inner button).
          "motion-safe:transition-[transform,background-color,border-color]",
          "motion-safe:[&:has(button:active)]:scale-[0.99]",
          "[&:focus-within]:border-white/[0.12]",
          "hover:border-white/[0.15] hover:bg-white/[0.06]",
        )}
      >
        <button
          type="button"
          aria-label="Show acknowledgement for removed charger"
          className={cn(
            "w-full cursor-pointer rounded-2xl text-left outline-none active:opacity-95",
            "focus-visible:ring-2 focus-visible:ring-primary/35",
          )}
          onClick={handleRemovedTap}
        >
          {body}
        </button>
        {emojiIds.map((id) => (
          <FloatingSadEmoji key={id} emojiId={id} onAnimationEnd={popEmojiDone} />
        ))}
      </GlassCard>
    );
  }

  return (
    <Link
      href={`/charger/${update.id}`}
      className={cn(
        "block rounded-3xl outline-none",
        "focus-visible:ring-2 focus-visible:ring-primary/35",
      )}
    >
      <GlassCard className="p-5 shadow-none motion-safe:transition-[transform,background-color,border-color] motion-safe:active:scale-[0.99] [&:focus-within]:border-white/[0.12] hover:border-white/[0.15] hover:bg-white/[0.06]">
        {body}
      </GlassCard>
    </Link>
  );
}
