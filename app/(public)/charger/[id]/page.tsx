import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ExternalLink, TriangleAlert } from "lucide-react";
import {
  ApiError,
  getSupercharger,
  type SuperchargerDetail,
  type SuperchargerHistoryStatus,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/glass-card";
import { StatusBadge } from "@/components/StatusBadge";
import { ChargerDetailMap } from "@/components/ChargerDetailMap";
import { BackToSitesLink } from "@/components/BackToSitesLink";

type ChargerPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: ChargerPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const charger = await getSupercharger(id);
    const statusLabel = formatStatusLabel(charger.status).toLowerCase();
    const location = [charger.city, charger.region].filter(Boolean).join(", ");
    const description = `Supercharger${location ? ` in ${location}` : ""} is ${statusLabel}. Track its buildout progress on Soonercharger.`;

    const title = location || charger.title;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `/charger/${id}`,
      },
      alternates: {
        canonical: `/charger/${id}`,
      },
    };
  } catch {
    return {
      title: "Supercharger Details",
    };
  }
}

const PHASE_STEPS = [
  {
    id: "IN_DEVELOPMENT",
    label: "In development",
    emoji: "📋",
  },
  {
    id: "UNDER_CONSTRUCTION",
    label: "Under construction",
    emoji: "🚧",
  },
  {
    id: "OPENED",
    label: "Opened",
    emoji: "⚡",
  },
] as const;

// These sections are hidden until we have richer per-site history. Today the
// first-seen/current-phase dates are often identical across imported sites,
// which makes the timeline look misleadingly uniform for customers.
// TODO enable this again once we have meaningful data
const showTimingSummary = false;
const showBuildoutTimeline = false;

export default async function ChargerPage({ params }: ChargerPageProps) {
  await connection();

  const { id } = await params;
  let charger: SuperchargerDetail | null = null;
  let loadError = false;

  try {
    charger = await getSupercharger(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    loadError = true;
  }

  if (loadError || !charger) {
    return (
      <div className="mx-auto flex min-h-full w-full max-w-4xl flex-1 flex-col justify-center px-8 py-16 sm:px-12">
        <GlassCard className="overflow-hidden p-0">
          <div className="bg-[radial-gradient(circle_at_top_left,_rgba(255,149,0,0.22),_transparent_42%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.08),_transparent_35%)] p-8">
            <div className="mb-6 inline-flex size-12 items-center justify-center rounded-2xl border border-orange-500/30 bg-orange-500/10 text-orange-400">
              <TriangleAlert className="size-6" />
            </div>
            <h1 className="text-3xl font-semibold text-foreground">
              Charger data unavailable
            </h1>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground">
              We couldn&apos;t load this charger overview right now. The server
              may be temporarily unavailable.
            </p>
          </div>
        </GlassCard>
      </div>
    );
  }

  const currentPhaseStartedAt =
    [...charger.status_history]
      .reverse()
      .find((entry) => entry.new_status === charger.status)?.changed_at ??
    charger.first_seen_at;
  const currentPhaseDuration = formatElapsed(
    currentPhaseStartedAt,
    charger.last_scraped_at,
  );
  const timelineStates = PHASE_STEPS.map((step) =>
    getPhaseStepState(step.id, charger, currentPhaseStartedAt),
  );

  const baseUrl = process.env.SITE_URL ?? "https://soonercharger.com";
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "All upcoming sites",
        item: `${baseUrl}/list`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: charger.title,
        item: `${baseUrl}/charger/${charger.id}`,
      },
    ],
  };

  return (
    <div className="mx-auto min-h-full w-full max-w-6xl overflow-x-clip px-6 py-8 sm:px-10 sm:py-12 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="mb-6">
        <BackToSitesLink />
      </nav>
      <div className="grid gap-6 xl:min-h-[760px] xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="grid gap-6 xl:h-full xl:grid-rows-[auto_minmax(0,1fr)]">
          <GlassCard className="overflow-hidden p-0">
            <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,149,0,0.22),_transparent_34%),radial-gradient(circle_at_80%_30%,_rgba(0,255,159,0.12),_transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-8 sm:p-10">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px] opacity-20" />
              <div className="relative">
                <h1 className="max-w-[10ch] text-balance font-heading text-[clamp(2.75rem,7vw,5rem)] leading-[0.92] font-semibold tracking-tight text-foreground">
                  {charger.title}
                </h1>

                <div className="mt-5">
                  <StatusBadge status={charger.status} size="md" />
                </div>

                <div className="mt-8 flex flex-wrap gap-4">
                  {showTimingSummary && (
                    <>
                      {/* Restore these when first-seen and phase-duration data varies enough to be customer-useful. */}
                      <SummaryItem
                        label="First seen"
                        value={formatDateTime(charger.first_seen_at)}
                        className="min-w-[15rem] flex-1"
                      />
                      <SummaryItem
                        label={`${formatStatusLabel(charger.status)} for`}
                        value={currentPhaseDuration}
                        className="min-w-[15rem] flex-1"
                      />
                    </>
                  )}
                  <a
                    href={charger.tesla_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex min-h-28 min-w-[15rem] flex-1 flex-col justify-between rounded-2xl border border-primary/25 bg-primary/10 px-5 py-4 text-left text-primary transition-colors hover:bg-primary/15"
                  >
                    <span className="block text-xs font-medium uppercase tracking-[0.16em] text-primary/70">
                      Source
                    </span>
                    <span className="mt-4 flex items-end justify-between gap-4">
                      <span className="text-base font-semibold text-primary sm:text-lg">
                        View on Tesla.com
                      </span>
                      <ExternalLink className="size-5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </GlassCard>

          {showBuildoutTimeline && (
            // Restore this card when imported status history has distinct, trustworthy milestone dates.
            <GlassCard className="flex flex-col xl:min-h-0">
              <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Timeline
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-foreground">
                  Buildout progress
                </h2>
              </div>

              <div className="flex flex-col xl:flex-1 xl:justify-center">
                {timelineStates.map((step, index) => (
                  <div key={step.id} className="flex gap-5">
                    <div className="flex w-11 flex-col items-center">
                      <span
                        className={cn(
                          "flex size-11 items-center justify-center rounded-full border text-lg shadow-sm",
                          step.variant,
                        )}
                      >
                        {step.emoji}
                      </span>
                      {index < timelineStates.length - 1 && (
                        <span
                          className={cn(
                            "my-3 h-18 rounded-full",
                            step.isReached &&
                              timelineStates[index + 1]?.isReached
                              ? "w-0.5 bg-emerald-400/60"
                              : "w-px bg-white/10",
                          )}
                        />
                      )}
                    </div>
                    <div
                      className={cn(
                        "pt-1",
                        index < timelineStates.length - 1 && "pb-6",
                      )}
                    >
                      <p className="text-base font-semibold text-foreground">
                        {step.label}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {step.copy}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>

        <GlassCard className="overflow-hidden p-0 xl:flex xl:h-full xl:min-h-0 xl:flex-col">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Map
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-foreground">
                Find it on the map
              </h2>
            </div>
          </div>
          <Link
            href={`/map?charger=${charger.id}`}
            className="block h-[360px] outline-none transition-opacity hover:opacity-95 focus-visible:ring-2 focus-visible:ring-primary/40 sm:h-[420px] xl:min-h-0 xl:flex-1"
          >
            <ChargerDetailMap
              latitude={charger.latitude}
              longitude={charger.longitude}
              status={charger.status}
            />
          </Link>
        </GlassCard>
      </div>
    </div>
  );
}

function SummaryItem({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-28 flex-col justify-between rounded-2xl border border-white/10 bg-black/15 px-5 py-4 backdrop-blur-sm",
        className,
      )}
    >
      <p className="text-xs font-medium uppercase leading-snug tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-4 text-[clamp(1.75rem,4vw,2.4rem)] font-semibold leading-[1.05] text-foreground">
        {value}
      </p>
    </div>
  );
}

function getPhaseStepState(
  stepId: (typeof PHASE_STEPS)[number]["id"],
  charger: SuperchargerDetail,
  currentPhaseStartedAt: string,
) {
  const stepIndex = PHASE_STEPS.findIndex((step) => step.id === stepId);
  const currentPhaseIndex = PHASE_STEPS.findIndex(
    (step) => step.id === charger.status,
  );
  const reachedAt =
    charger.status_history.find((entry) => entry.new_status === stepId)
      ?.changed_at ?? null;
  const hasReachedStep =
    reachedAt !== null ||
    (currentPhaseIndex !== -1 &&
      stepIndex !== -1 &&
      stepIndex < currentPhaseIndex);
  const isCurrentStep = charger.status === stepId;

  if (isCurrentStep) {
    const startedAt =
      stepId === "IN_DEVELOPMENT" && !reachedAt
        ? charger.first_seen_at
        : currentPhaseStartedAt;

    return {
      id: stepId,
      label: formatStatusLabel(stepId),
      emoji: getPhaseEmoji(stepId),
      variant:
        "border-2 border-emerald-400/70 bg-emerald-400/6 text-emerald-200",
      isReached: true,
      copy: `Started ${formatDateTime(startedAt)}`,
    };
  }

  if (hasReachedStep) {
    const inferredReachedAt = reachedAt ?? charger.first_seen_at;

    return {
      id: stepId,
      label: formatStatusLabel(stepId),
      emoji: getPhaseEmoji(stepId),
      variant:
        "border-2 border-emerald-400/70 bg-emerald-400/6 text-emerald-200",
      isReached: true,
      copy:
        stepId === "OPENED"
          ? `Opened ${formatDateTime(inferredReachedAt)}`
          : `Started ${formatDateTime(inferredReachedAt)}`,
    };
  }

  return {
    id: stepId,
    label: formatStatusLabel(stepId),
    emoji: getPhaseEmoji(stepId),
    variant: "border-2 border-white/12 bg-white/[0.03] text-muted-foreground",
    isReached: false,
    copy: "Not reached yet",
  };
}

function getPhaseEmoji(
  status: "IN_DEVELOPMENT" | "UNDER_CONSTRUCTION" | "OPENED",
) {
  if (status === "IN_DEVELOPMENT") return "📋";
  if (status === "UNDER_CONSTRUCTION") return "🚧";
  return "⚡";
}

function formatStatusLabel(status: SuperchargerHistoryStatus) {
  if (status === "IN_DEVELOPMENT") return "In development";
  if (status === "UNDER_CONSTRUCTION") return "Under construction";
  if (status === "OPENED") return "Opened";
  if (status === "REMOVED") return "Removed";
  return "Unknown";
}

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

function formatElapsed(startIso: string, endIso: string) {
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
  const days = Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));

  if (days === 0) return "today";
  if (days === 1) return "1 day";
  return `${new Intl.NumberFormat("en-US").format(days)} days`;
}
