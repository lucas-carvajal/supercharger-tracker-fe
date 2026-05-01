import type { SuperchargerHistoryStatus } from "@/lib/api";

export const STATUS_CONFIG: Record<
  SuperchargerHistoryStatus,
  { label: string; hex: string; dot: string; badge: string }
> = {
  IN_DEVELOPMENT: {
    label: "In Development",
    hex: "#00FF9F", // vibrant mint / neon green-cyan
    dot: "bg-emerald-400", // or "bg-[#00FF9F]" if you prefer exact match
    badge: "border-emerald-400/30 bg-emerald-400/10 text-emerald-400",
  },
  UNDER_CONSTRUCTION: {
    label: "Under Construction",
    hex: "#FF9500", // bright Tesla-style orange
    dot: "bg-orange-500", // strong and visible
    badge: "border-orange-500/30 bg-orange-500/10 text-orange-500",
  },
  OPENED: {
    label: "Opened",
    hex: "#22c55e",
    dot: "bg-green-400",
    badge: "border-green-400/30 bg-green-400/10 text-green-400",
  },
  REMOVED: {
    label: "Removed",
    hex: "#f87171",
    dot: "bg-red-400",
    badge: "border-red-400/30 bg-red-400/10 text-red-400",
  },
  UNKNOWN: {
    label: "Unknown",
    hex: "#71717a",
    dot: "bg-zinc-500",
    badge: "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",
  },
};
