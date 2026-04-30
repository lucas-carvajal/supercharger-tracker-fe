import Link from "next/link";
import { MapPinned } from "lucide-react";
import { GoBackButton } from "@/components/GoBackButton";
import { GlassCard } from "@/components/ui/glass-card";

export default function ChargerNotFound() {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-4xl flex-1 flex-col justify-center px-8 py-16 sm:px-12">
      <GlassCard className="overflow-hidden p-0">
        <div className="bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.16),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(255,149,0,0.2),_transparent_38%)] p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Charger overview
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-foreground">
            Charger not found
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground">
            It may have been removed, opened already, or the link may be wrong.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <GoBackButton />
            <Link
              href="/map"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-white/15 hover:text-foreground"
            >
              <MapPinned className="size-4" />
              Browse the map
            </Link>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
