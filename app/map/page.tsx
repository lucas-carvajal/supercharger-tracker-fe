import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { SuperchargerMap } from "@/components/SuperchargerMap";
import { getMapItems, type SuperchargerMapItem } from "@/lib/api";
import { OverlayNotice } from "@/components/ui/overlay-notice";

export const metadata: Metadata = {
  title: "Map",
  description:
    "Interactive map of every Tesla Supercharger coming soon, under construction, or in development across the globe.",
  openGraph: {
    title: "Soonercharger Map",
    description:
      "Explore all upcoming Tesla Supercharger locations on an interactive map.",
    url: "/map",
  },
  alternates: {
    canonical: "/map",
  },
};

export default async function MapPage() {
  await connection();

  let items: SuperchargerMapItem[] = [];
  let loadError = false;

  try {
    items = await getMapItems();
  } catch {
    loadError = true;
  }

  return (
    <div className="flex h-screen flex-col">
      {loadError && (
        <OverlayNotice
          title="Map data unavailable"
          message="We're having trouble loading map data right now. Please try again later."
        />
      )}

      <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-4">
        <div>
          <h1 className="text-lg font-bold text-foreground">
            Soonercharger Map
          </h1>
          <p className="text-xs text-muted-foreground">
            {items.length} coming soon locations
          </p>
        </div>
        <Link
          href="/"
          className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
        >
          Back to list
        </Link>
      </header>
      <main className="relative min-h-0 flex-1">
        <SuperchargerMap items={items} />
      </main>
    </div>
  );
}
