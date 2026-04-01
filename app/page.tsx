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
          Tesla Supercharger Tracker
        </p>
        <h1 className="font-heading text-6xl font-bold tracking-tight text-foreground sm:text-8xl">
          Soonercharger
        </h1>
        <p className="mx-auto mt-5 max-w-md text-base text-muted-foreground sm:text-lg">
          Track the expansion of the world&apos;s biggest charging network
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          <span className="font-semibold tabular-nums text-foreground">
            {data.total}
          </span>{" "}
          locations coming soon
        </p>
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
