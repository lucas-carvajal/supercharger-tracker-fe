import type { Metadata } from "next";
import { connection } from "next/server";
import { getRecentUpdates } from "@/lib/api";
import { StatusUpdatesRows } from "@/components/StatusUpdatesRows";
import { OverlayNotice } from "@/components/ui/overlay-notice";
import { GlassCard } from "@/components/ui/glass-card";

export const metadata: Metadata = {
  title: "Charger Status Updates",
  description:
    "Recent Tesla Supercharger activity: newly added sites, construction progress, and openings.",
  openGraph: {
    title: "Charger Status Updates",
    description:
      "See newly added Supercharger sites and the latest status transitions worldwide.",
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

  let response: Awaited<ReturnType<typeof getRecentUpdates>> = {
    items: [],
    total: 0,
  };

  try {
    response = await getRecentUpdates(20, 0);
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
          Newly added Supercharger sites and recent status changes, newest first.
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
              No recent updates yet. Check back soon, or browse upcoming sites
              on the list or map.
            </p>
          </GlassCard>
        ) : (
          <StatusUpdatesRows
            initialUpdates={response.items}
            initialTotal={response.total}
          />
        )}
      </main>
    </div>
  );
}
