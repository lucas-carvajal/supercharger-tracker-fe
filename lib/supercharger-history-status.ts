import type { SuperchargerStatus } from "@/lib/api";

/** Sentence-style labels used in history/transition copy. */
export function sentenceCaseHistoryStatusLabel(
  status: SuperchargerStatus,
): string {
  switch (status) {
    case "PRELIMINARY":
      return "Preliminary planning";
    case "DESIGN":
      return "In design";
    case "CONSTRUCTION":
      return "Under construction";
    case "OPENED":
      return "Opened";
    case "REMOVED":
      return "Removed";
    case "UNKNOWN":
    default:
      return "Unknown";
  }
}

export function showsFromStatus(
  oldStatus: SuperchargerStatus | null,
): oldStatus is Exclude<SuperchargerStatus, "UNKNOWN" | "REMOVED"> {
  return (
    oldStatus !== null && oldStatus !== "UNKNOWN" && oldStatus !== "REMOVED"
  );
}

export function transitionDisplayText(params: {
  old_status: SuperchargerStatus | null;
  new_status: SuperchargerStatus;
}): string {
  const newLabel = sentenceCaseHistoryStatusLabel(params.new_status);
  if (!showsFromStatus(params.old_status)) {
    return `→ ${newLabel}`;
  }
  const oldLabel = sentenceCaseHistoryStatusLabel(params.old_status);
  return `${oldLabel} → ${newLabel}`;
}
