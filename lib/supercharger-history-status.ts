import type { SuperchargerStatus } from "@/lib/api";

/** Matches legacy charger-detail copy (sentence-style labels). */
export function sentenceCaseHistoryStatusLabel(
  status: SuperchargerStatus,
): string {
  switch (status) {
    case "IN_DEVELOPMENT":
      return "In development";
    case "UNDER_CONSTRUCTION":
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

export function transitionDisplayText(params: {
  old_status: SuperchargerStatus;
  new_status: SuperchargerStatus;
}): string {
  const newLabel = sentenceCaseHistoryStatusLabel(params.new_status);
  if (params.old_status === "UNKNOWN") {
    return `→ ${newLabel}`;
  }
  const oldLabel = sentenceCaseHistoryStatusLabel(params.old_status);
  return `${oldLabel} → ${newLabel}`;
}
