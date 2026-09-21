const longDate = new Intl.DateTimeFormat("en-AU", {
  dateStyle: "long",
  timeZone: "UTC",
});

const weekdayDate = new Intl.DateTimeFormat("en-AU", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const canberraDateTime = new Intl.DateTimeFormat("en-AU", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Australia/Canberra",
});

/** Format a date-only value without letting the viewer's timezone move it. */
export function formatCourseDate(value: Date | string): string {
  const date = typeof value === "string" ? new Date(`${value}T00:00:00Z`) : value;
  return longDate.format(date);
}

/** A date-only value with its weekday: "Wednesday 21 April 2027". */
export function formatCourseDay(value: Date | string): string {
  const date = typeof value === "string" ? new Date(`${value}T00:00:00Z`) : value;
  return weekdayDate.format(date).replace(",", "");
}

/** A due moment in Canberra time: "12:00 pm, Monday 8 March 2027". */
export function formatDue(value: Date): string {
  const parts = Object.fromEntries(
    canberraDateTime.formatToParts(value).map((p) => [p.type, p.value]),
  );
  return `${parts.hour}:${parts.minute} ${parts.dayPeriod?.toLowerCase()}, ${parts.weekday} ${parts.day} ${parts.month} ${parts.year}`;
}

/** A 24-hour "HH:MM" as "2:00 pm". */
export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "pm" : "am";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

/** "2:00 pm to 5:00 pm" from two "HH:MM" values. */
export function formatSlot(start: unknown, end: unknown): string | undefined {
  if (typeof start !== "string" || typeof end !== "string") return undefined;
  return `${formatTime(start)} to ${formatTime(end)}`;
}
