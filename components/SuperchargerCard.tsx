"use client";

import { useRouter } from "next/navigation";
import type { Supercharger } from "@/lib/api";
import { GlassCard } from "@/components/ui/glass-card";
import { StatusBadge } from "@/components/StatusBadge";

export function SuperchargerCard({
  supercharger,
}: {
  supercharger: Supercharger;
}) {
  const router = useRouter();

  return (
    <GlassCard
      className="animate-card-enter relative flex cursor-pointer flex-col transition-all outline-none active:scale-95 hover:border-white/[0.15] hover:bg-white/[0.08] hover:shadow-lg focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/30 [@media(hover:hover)]:hover:scale-[1.03]"
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/charger/${supercharger.id}`)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          router.push(`/charger/${supercharger.id}`);
        }
      }}
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
    </GlassCard>
  );
}
