import type { Metadata } from "next";
import { connection } from "next/server";
import { SuperchargerMap } from "@/components/SuperchargerMap";
import { getMapItems, type SuperchargerMapItem } from "@/lib/api";
import { OverlayNotice } from "@/components/ui/overlay-notice";

export const metadata: Metadata = {
  title: "Map",
  description:
    "Interactive map of every Tesla Supercharger coming soon across the globe.",
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
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      {loadError && (
        <OverlayNotice
          title="Map data unavailable"
          message="We're having trouble loading map data right now. Please try again later."
        />
      )}
      <main className="relative min-h-0 flex-1">
        <SuperchargerMap items={items} />
      </main>
    </div>
  );
}
