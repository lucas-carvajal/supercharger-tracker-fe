import type { Metadata } from "next";
import { connection } from "next/server";
import { getRecentStatusChanges } from "@/lib/api";
import { StatusUpdatesRows } from "@/components/StatusUpdatesRows";
import { OverlayNotice } from "@/components/ui/overlay-notice";
import { GlassCard } from "@/components/ui/glass-card";

export const metadata: Metadata = {
  title: "Charger Status Updates",
  description:
    "Recent Tesla Supercharger coming-soon status changes: construction progress, openings, and removals.",
  openGraph: {
    title: "Charger Status Updates",
    description:
      "See the latest status transitions for tracked Supercharger sites worldwide.",
    url: "/status-updates",
  },
  alternates: {
    canonical: "/status-updates",
  },
};

export default async function StatusUpdatesPage() {
  await connection();

  let loadError = false;
  let empty = false;

  let response: Awaited<ReturnType<typeof getRecentStatusChanges>> = {
    items: [],
    total: 0,
  };

  try {
    response = await getRecentStatusChanges(20, 0);
    empty = response.items.length === 0;
  } catch {
    loadError = true;
  }

  return (
    <div className="mx-auto w-full max-w-2xl overflow-x-clip px-6 py-10 sm:px-12 sm:py-14 lg:px-8">
      <header className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Activity
        </p>
        <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Charger Status Updates
        </h1>
        <p className="mt-3 max-w-prose text-sm text-muted-foreground sm:text-base">
          See all recent status changes from tracked Supercharger locations.
        </p>
      </header>

      <main>
        {loadError ? (
          <OverlayNotice
            title="Updates unavailable"
            message="We're having trouble loading status updates right now. Please try again later."
          />
        ) : empty ? (
          <GlassCard className="p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No recent status changes yet. Check back soon, or browse upcoming
              sites on the list or map.
            </p>
          </GlassCard>
        ) : (
          <StatusUpdatesRows changes={response.items} />
        )}
      </main>
    </div>
  );
}
