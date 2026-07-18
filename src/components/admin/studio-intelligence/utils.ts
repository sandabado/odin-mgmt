type DateValue = string | null | undefined;

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const compactNumberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function calendarDate(value: DateValue) {
  if (!value) return null;
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatStudioDate(value: DateValue, format: "long" | "short" = "long") {
  const date = calendarDate(value);
  if (!date) return "TBD";
  return (format === "short" ? shortDateFormatter : dateFormatter).format(date);
}

export function formatStudioCurrency(cents: number | null | undefined) {
  if (cents === null || cents === undefined) return "Value pending";
  return currencyFormatter.format(cents / 100);
}

export function formatStudioReach(value: number | null | undefined) {
  return compactNumberFormatter.format(value ?? 0);
}

export function toSentence(value: string) {
  return value.replaceAll("_", " ");
}

export function toLabel(value: string) {
  return toSentence(value).replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function countdownLabel(value: DateValue) {
  const target = calendarDate(value);
  if (!target) return "Date TBD";
  const today = new Date();
  const todayAtUtcMidnight = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const difference = Math.round((target.getTime() - todayAtUtcMidnight) / 86_400_000);

  if (difference === 0) return "Today";
  if (difference === 1) return "Tomorrow";
  if (difference === -1) return "Yesterday";
  if (difference > 1 && difference < 31) return `${difference} days out`;
  if (difference < -1) return `${Math.abs(difference)} days ago`;
  return formatStudioDate(value, "short");
}

export function dateRangeLabel(start: DateValue, end: DateValue) {
  if (!start && !end) return "Dates TBD";
  if (!start) return `Through ${formatStudioDate(end, "short")}`;
  if (!end) return `From ${formatStudioDate(start, "short")}`;
  return `${formatStudioDate(start, "short")} → ${formatStudioDate(end, "short")}`;
}

export function dateRangeProgress(start: DateValue, end: DateValue) {
  const startDate = calendarDate(start);
  const endDate = calendarDate(end);
  if (!startDate || !endDate || endDate <= startDate) return 0;

  const today = new Date();
  const current = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return Math.max(0, Math.min(100, Math.round(((current - startDate.getTime()) / (endDate.getTime() - startDate.getTime())) * 100)));
}
