import Link from "next/link";
import { SuperchargerMap } from "@/components/SuperchargerMap";
import type { SuperchargerMapItem } from "@/lib/api";

async function getMapItems(): Promise<SuperchargerMapItem[]> {
  const baseUrl = process.env.SUPERCHARGER_API_URL;
  if (!baseUrl) throw new Error("SUPERCHARGER_API_URL is not set");

  const res = await fetch(`${baseUrl}/superchargers/soon/map`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.json() as Promise<SuperchargerMapItem[]>;
}

export default async function MapPage() {
  const items = await getMapItems();

  return (
    <div className="flex h-screen flex-col">
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
