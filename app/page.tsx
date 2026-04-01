import { getSuperchargersSoon, getStats } from "@/lib/api";
import { SuperchargerList } from "@/components/SuperchargerList";

export default async function Home() {
  const [data, stats] = await Promise.all([
    getSuperchargersSoon(30),
    getStats().catch(() => null),
  ]);

  return (
    <div className="mx-auto min-h-full w-full max-w-6xl px-4 py-16 sm:px-8">
      <header className="mb-16 text-center">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Tesla Supercharger Buildout Tracker
        </p>
        <h1 className="font-heading text-6xl font-bold tracking-tight text-foreground sm:text-8xl">
          Soonercharger
        </h1>
        <p className="mx-auto mt-6 text-xl text-muted-foreground sm:text-2xl">
          Track the expansion of the world&apos;s biggest charging network in
          real time
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-x-10 gap-y-4">
          <div className="flex flex-col items-center">
            <span className="text-4xl font-bold tabular-nums text-foreground">
              {stats?.total_active ?? data.total}
            </span>
            <span className="mt-1 text-sm text-muted-foreground">
              chargers coming soon
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-bold tabular-nums text-foreground">
              {stats?.by_status["UNDER_CONSTRUCTION"] ?? "—"}
            </span>
            <span className="mt-1 text-sm text-muted-foreground">
              under construction
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-bold tabular-nums text-foreground">
              {stats?.by_status["IN_DEVELOPMENT"] ?? "—"}
            </span>
            <span className="mt-1 text-sm text-muted-foreground">
              in development
            </span>
          </div>
        </div>
      </header>
      <main>
        <SuperchargerList
          initialItems={data.items}
          initialTotal={data.total}
          stats={stats}
        />
      </main>
    </div>
  );
}
