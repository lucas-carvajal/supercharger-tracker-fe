import Link from "next/link";
import type { Supercharger } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";

export function SuperchargerCard({
  supercharger,
}: {
  supercharger: Supercharger;
}) {
  return (
    <Link
      href={`/charger/${supercharger.id}`}
      className="glass-card animate-card-enter relative flex flex-col rounded-xl p-5 transition-all outline-none active:scale-95 hover:border-white/[0.15] hover:bg-white/[0.08] hover:shadow-lg focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/30 [@media(hover:hover)]:hover:scale-[1.03]"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <h2 className="text-base font-semibold leading-snug text-foreground">
          {supercharger.title}
        </h2>
        <StatusBadge status={supercharger.status} className="shrink-0" />
      </div>
      {(supercharger.city || supercharger.region) && (
        <p className="text-sm text-muted-foreground">
          {[supercharger.city, supercharger.region].filter(Boolean).join(", ")}
        </p>
      )}
    </Link>
  );
}
