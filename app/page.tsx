import { getSuperchargersSoon, getStats } from "@/lib/api";
import { SuperchargerList } from "@/components/SuperchargerList";

export default async function Home() {
  const [data, stats] = await Promise.all([
    getSuperchargersSoon(30),
    getStats().catch(() => null),
  ]);

  return (
    <div className="mx-auto min-h-full w-full max-w-6xl overflow-x-clip px-8 py-12 sm:px-12 sm:py-16 lg:px-8">
      <header className="mb-16 text-center">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Tesla Supercharger Buildout Tracker
        </p>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-8xl">
          Soonercharger
        </h1>
        <p className="mx-auto mt-6 text-base text-muted-foreground sm:text-xl lg:text-2xl">
          Track the expansion of the world&apos;s biggest charging network in
          real time
        </p>
        <div className="mt-8 grid grid-cols-3 gap-4 sm:flex sm:flex-wrap sm:justify-center sm:gap-x-10 sm:gap-y-4">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold tabular-nums text-foreground sm:text-4xl">
              {stats?.total_active ?? data.total}
            </span>
            <span className="mt-1 text-xs text-muted-foreground sm:text-sm">
              coming soon
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold tabular-nums text-foreground sm:text-4xl">
              {stats?.by_status["UNDER_CONSTRUCTION"] ?? "—"}
            </span>
            <span className="mt-1 text-xs text-muted-foreground sm:text-sm">
              under construction
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold tabular-nums text-foreground sm:text-4xl">
              {stats?.by_status["IN_DEVELOPMENT"] ?? "—"}
            </span>
            <span className="mt-1 text-xs text-muted-foreground sm:text-sm">
              in development
            </span>
          </div>
        </div>
      </header>
      <main>
        <SuperchargerList initialItems={data.items} initialTotal={data.total} />
      </main>
      <footer className="mt-24 pb-8 text-center text-sm text-muted-foreground">
        Thanks Tesla Charging Team! Keep it up ⚡️
      </footer>
    </div>
  );
}
