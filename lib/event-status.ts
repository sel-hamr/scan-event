export type DisplayEventStatus =
  | "draft"
  | "published"
  | "ongoing"
  | "completed"
  | "cancelled";

export function getDisplayEventStatus(
  status: string,
  dateStart: Date | string,
  dateEnd: Date | string,
  now: Date = new Date(),
): DisplayEventStatus {
  const normalizedStatus = status.trim().toUpperCase();

  if (normalizedStatus === "DRAFT") {
    return "draft";
  }

  if (normalizedStatus === "CANCELLED") {
    return "cancelled";
  }

  const start = new Date(dateStart);
  const end = new Date(dateEnd);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "published";
  }

  if (now < start) {
    return "published";
  }

  if (now > end) {
    return "completed";
  }

  return "ongoing";
}
