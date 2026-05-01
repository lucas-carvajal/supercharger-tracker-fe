import { cn } from "@/lib/utils";
import { STATUS_CONFIG } from "@/lib/status";
import type { SuperchargerHistoryStatus } from "@/lib/api";

interface StatusBadgeProps {
  status: SuperchargerHistoryStatus;
  size?: "sm" | "md";
  className?: string;
}

const SIZE_STYLES = {
  sm: "gap-1.5 px-2.5 py-1 text-xs",
  md: "gap-2 px-3 py-1.5 text-sm",
} as const;

export function StatusBadge({
  status,
  size = "sm",
  className,
}: StatusBadgeProps) {
  const { label, dot, badge } = STATUS_CONFIG[status] ?? STATUS_CONFIG.UNKNOWN;

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full border font-medium",
        SIZE_STYLES[size],
        badge,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", dot)} />
      {label}
    </span>
  );
}
