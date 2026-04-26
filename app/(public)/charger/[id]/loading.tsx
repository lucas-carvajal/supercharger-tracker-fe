import { GlassCard } from "@/components/ui/glass-card";

function SummarySkeleton() {
  return (
    <GlassCard className="overflow-hidden p-0">
      <div className="p-8 sm:p-10">
        <div className="h-24 w-2/3 max-w-[24rem] animate-pulse rounded bg-white/10 sm:h-28" />
        <div className="mt-5 h-8 w-40 animate-pulse rounded-full bg-white/10" />
        <div className="mt-8 flex flex-wrap gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-28 min-w-[15rem] flex-1 animate-pulse rounded-2xl bg-white/[0.03]"
            />
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

function TimelineSkeleton() {
  return (
    <GlassCard className="xl:min-h-0">
      <div className="h-6 w-40 animate-pulse rounded bg-white/10" />
      <div className="mt-8 space-y-0 xl:flex xl:h-[calc(100%-3.5rem)] xl:flex-col xl:justify-center">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="size-11 animate-pulse rounded-full bg-white/10" />
              {index < 2 && <div className="my-2 h-12 w-px bg-white/10" />}
            </div>
            <div className="flex-1 pb-6 pt-1">
              <div className="h-5 w-40 animate-pulse rounded bg-white/10" />
              <div className="mt-2 h-4 w-32 animate-pulse rounded bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

export default function Loading() {
  return (
    <div className="mx-auto min-h-full w-full max-w-6xl overflow-x-clip px-6 py-8 sm:px-10 sm:py-12 lg:px-8">
      <div className="grid gap-6 xl:min-h-[760px] xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="grid gap-6 xl:h-full xl:grid-rows-[auto_minmax(0,1fr)]">
          <SummarySkeleton />
          <TimelineSkeleton />
        </div>
        <GlassCard className="overflow-hidden p-0 xl:flex xl:h-full xl:min-h-0 xl:flex-col">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <div>
              <div className="h-3 w-16 animate-pulse rounded bg-white/10" />
              <div className="mt-2 h-7 w-32 animate-pulse rounded bg-white/10" />
            </div>
            <div className="size-11 animate-pulse rounded-2xl bg-white/10" />
          </div>
          <div className="h-[360px] animate-pulse bg-white/[0.03] sm:h-[420px] xl:min-h-0 xl:flex-1" />
        </GlassCard>
      </div>
    </div>
  );
}
