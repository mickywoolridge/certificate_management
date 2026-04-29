import type { Certificate, NoticeUnit } from "@prisma/client";

export function noticeWindowStart(endDate: Date, quantity: number, unit: NoticeUnit): Date {
  const d = new Date(endDate);
  if (unit === "DAYS") {
    d.setUTCDate(d.getUTCDate() - quantity);
  } else if (unit === "WEEKS") {
    d.setUTCDate(d.getUTCDate() - quantity * 7);
  } else {
    d.setUTCMonth(d.getUTCMonth() - quantity);
  }
  return d;
}

/** True when now is on or after the notice window start and the tracked object is not yet expired. */
export function isInNoticePeriod(cert: Pick<Certificate, "endDate" | "noticeQuantity" | "noticeUnit">, now = new Date()): boolean {
  const start = noticeWindowStart(cert.endDate, cert.noticeQuantity, cert.noticeUnit);
  return now >= start && now <= cert.endDate;
}

export function daysUntilExpiry(endDate: Date, now = new Date()): number {
  const ms = endDate.getTime() - now.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function formatNoticePeriod(quantity: number, unit: NoticeUnit): string {
  const label =
    unit === "DAYS" ? (quantity === 1 ? "day" : "days") : unit === "WEEKS" ? (quantity === 1 ? "week" : "weeks") : quantity === 1 ? "month" : "months";
  return `${quantity} ${label}`;
}

/** True when both instants fall on the same calendar day in UTC (used to cap reminder emails to once per day). */
export function isSameUtcCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}
