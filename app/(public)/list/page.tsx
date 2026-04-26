import type { Metadata } from "next";
import { connection } from "next/server";
import {
  getSuperchargersSoon,
  type SuperchargersSoonResponse,
} from "@/lib/api";
import { SuperchargerList } from "@/components/SuperchargerList";

export const metadata: Metadata = {
  title: "All upcoming sites",
  description:
    "Browse every Tesla Supercharger coming soon worldwide. Filter by status and region.",
  openGraph: {
    title: "All upcoming Superchargers",
    description:
      "Browse every Tesla Supercharger coming soon worldwide. Filter by status and region.",
    url: "/list",
  },
  alternates: {
    canonical: "/list",
  },
};

export default async function ListPage() {
  await connection();

  let data: SuperchargersSoonResponse = { items: [], total: 0 };
  let loadError = false;

  try {
    data = await getSuperchargersSoon(30);
  } catch {
    loadError = true;
  }

  return (
    <div className="mx-auto w-full max-w-6xl overflow-x-clip px-6 py-10 sm:px-12 sm:py-14 lg:px-8">
      <header className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Coming soon
        </p>
        <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          All upcoming Superchargers
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Every site currently in development or under construction. Filter by
          status or region.
        </p>
      </header>
      <main>
        <SuperchargerList
          initialItems={data.items}
          initialTotal={data.total}
          initialError={loadError}
        />
      </main>
    </div>
  );
}
