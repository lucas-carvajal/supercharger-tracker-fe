import Link from "next/link";
import { Activity, List, MapPin } from "lucide-react";
import { connection } from "next/server";
import { getStats, getSuperchargersSoon } from "@/lib/api";

export default async function Home() {
  await connection();

  const [stats, soon] = await Promise.all([
    getStats().catch(() => null),
    getSuperchargersSoon(1).catch(() => null),
  ]);

  const totalComingSoon = stats?.total_active ?? soon?.total ?? null;
  const underConstruction = stats?.by_status["UNDER_CONSTRUCTION"] ?? null;
  const inDevelopment = stats?.by_status["IN_DEVELOPMENT"] ?? null;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 py-16 text-center sm:px-10 sm:py-24">
      <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
        Tesla Supercharger Buildout Tracker
      </p>
      <h1 className="font-heading text-[clamp(2.75rem,9vw,6rem)] font-bold leading-[0.95] tracking-tight text-foreground">
        Soonercharger
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-xl">
        Track the expansion of the world&apos;s biggest charging network in real
        time.
      </p>

      <div className="mt-10 grid w-full grid-cols-3 gap-4 sm:flex sm:flex-wrap sm:justify-center sm:gap-x-10 sm:gap-y-4">
        <Stat value={totalComingSoon} label="coming soon" />
        <Stat value={underConstruction} label="under construction" />
        <Stat value={inDevelopment} label="in development" />
      </div>

      <div className="mt-12 flex w-full flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4">
        <Link
          href="/list"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
        >
          <List className="size-4" />
          Browse the list
        </Link>
        <Link
          href="/map"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-emerald-950 transition-colors hover:bg-emerald-400 sm:w-auto"
        >
          <MapPin className="size-4" />
          Open the map
        </Link>
        <Link
          href="/status-updates"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-sky-400 sm:w-auto"
        >
          <Activity className="size-4" />
          Status updates
        </Link>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: number | null; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-2xl font-bold tabular-nums text-foreground sm:text-4xl">
        {value ?? "—"}
      </span>
      <span className="mt-1 text-xs text-muted-foreground sm:text-sm">
        {label}
      </span>
    </div>
  );
}
