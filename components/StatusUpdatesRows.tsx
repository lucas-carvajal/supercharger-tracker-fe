"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  RecentStatusChange,
  SuperchargerHistoryStatus,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/glass-card";
import { StatusBadge } from "@/components/StatusBadge";
import { formatUtcDateShort } from "@/lib/date-display";
import { transitionDisplayText } from "@/lib/supercharger-history-status";

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
  changes: RecentStatusChange[];
}

export function StatusUpdatesRows({ changes }: StatusUpdatesRowsProps) {
  return (
    <ul className="grid list-none gap-4 p-0">
      {changes.map((change) => (
        <li key={`${change.id}-${change.changed_at}`}>
          <StatusUpdateRow change={change} />
        </li>
      ))}
    </ul>
  );
}

function StatusTransitionBadges({
  oldStatus,
  newStatus,
  transitionLabel,
}: {
  oldStatus: SuperchargerHistoryStatus;
  newStatus: SuperchargerHistoryStatus;
  transitionLabel: string;
}) {
  const showFrom = oldStatus !== "UNKNOWN";

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

function StatusUpdateRow({ change }: { change: RecentStatusChange }) {
  const title = change.title.trim() ? change.title.trim() : "Unnamed location";
  const transitionLabel = transitionDisplayText({
    old_status: change.old_status,
    new_status: change.new_status,
  });
  const dateDisplay = formatUtcDateShort(change.changed_at);

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
        {change.new_status === "OPENED" ? (
          <ExternalLink
            className="size-3.5 shrink-0 text-muted-foreground"
            aria-hidden
          />
        ) : null}
      </div>
      <StatusTransitionBadges
        oldStatus={change.old_status}
        newStatus={change.new_status}
        transitionLabel={transitionLabel}
      />
      <time
        dateTime={change.changed_at.slice(0, 10)}
        className="text-xs tabular-nums text-muted-foreground"
      >
        {dateDisplay}
      </time>
    </div>
  );

  if (change.new_status === "OPENED") {
    return (
      <GlassCard className="p-5 shadow-none">
        <a
          href={`https://www.tesla.com/findus?location=${encodeURIComponent(change.id)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-2xl outline-none transition-colors active:opacity-95 focus-visible:ring-2 focus-visible:ring-primary/35"
        >
          {body}
        </a>
      </GlassCard>
    );
  }

  if (change.new_status === "REMOVED") {
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
      href={`/charger/${change.id}`}
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
