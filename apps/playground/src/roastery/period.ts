import type { DateRangeValue } from "@buttery/react";
import { HISTORY, TODAY, dayNumber, daysBefore, ordersOn } from "./data.ts";
import type { Order } from "./data.ts";

/** A local calendar day from an ISO date such as "2026-10-01". */
function dayFrom(iso: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (match === null) return undefined;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

const FIRST_DAY = daysBefore(TODAY, HISTORY - 1);

function clamp(day: Date): Date {
  if (dayNumber(day) < dayNumber(FIRST_DAY)) return FIRST_DAY;
  if (dayNumber(day) > dayNumber(TODAY)) return TODAY;
  return day;
}

function startOf(period: DateRangeValue): Date {
  const year = TODAY.getFullYear();
  const month = TODAY.getMonth();
  const date = TODAY.getDate();
  switch (period.range) {
    case "today":
      return TODAY;
    case "last-7-days":
      return daysBefore(TODAY, 6);
    case "last-4-weeks":
      return daysBefore(TODAY, 27);
    case "last-3-months":
      return new Date(year, month - 3, date + 1);
    case "last-12-months":
      return new Date(year - 1, month, date + 1);
    case "month-to-date":
      return new Date(year, month, 1);
    case "year-to-date":
      return new Date(year, 0, 1);
    case "custom":
      return clamp(dayFrom(period.custom?.start ?? "") ?? TODAY);
  }
}

function endOf(period: DateRangeValue): Date {
  return period.range === "custom"
    ? clamp(dayFrom(period.custom?.end ?? "") ?? TODAY)
    : TODAY;
}

/** Every calendar day from `start` to `end`, oldest first. */
function daysFrom(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  for (
    let day = new Date(start);
    dayNumber(day) <= dayNumber(end);
    day = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1)
  )
    days.push(day);
  return days;
}

/** The days a period covers, oldest first. */
export function periodDays(period: DateRangeValue): Date[] {
  return daysFrom(startOf(period), endOf(period));
}

/** The days a period is compared with: as many just before it, or the same dates a year earlier. */
export function comparisonDays(
  period: DateRangeValue,
  days: readonly Date[],
): Date[] | undefined {
  const [first] = days;
  if (first === undefined) return undefined;
  switch (period.comparison) {
    case "none":
      return undefined;
    case "previous-period":
      return daysFrom(daysBefore(first, days.length), daysBefore(first, 1));
    case "previous-year":
      return days.map(
        (day) => new Date(day.getFullYear() - 1, day.getMonth(), day.getDate()),
      );
  }
}

/** The period's days in the groups its charts plot: one a day, seven a week counted back from today, or a calendar month each. */
export function buckets(
  days: readonly Date[],
  interval: DateRangeValue["interval"],
): Date[][] {
  switch (interval) {
    case "daily":
      return days.map((day) => [day]);
    case "weekly": {
      const groups: Date[][] = [];
      for (let end = days.length; end > 0; end -= 7)
        groups.unshift(days.slice(Math.max(0, end - 7), end));
      return groups;
    }
    case "monthly": {
      const groups: Date[][] = [];
      for (const day of days) {
        const last = groups.at(-1);
        const month = last?.[0];
        if (
          month?.getMonth() === day.getMonth() &&
          month.getFullYear() === day.getFullYear()
        )
          last?.push(day);
        else groups.push([day]);
      }
      return groups;
    }
  }
}

/** The comparison's days in groups the same size as the period's, so its points line up with them. */
export function alignedBuckets(
  groups: readonly (readonly Date[])[],
  days: readonly Date[],
): Date[][] {
  let from = 0;
  return groups.map((group) => {
    const part = days.slice(from, from + group.length);
    from += group.length;
    return part;
  });
}

const DAY = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});
const MONTH = new Intl.DateTimeFormat("en-US", { month: "short" });
const MONTH_AND_YEAR = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
});

/** A point's label: its first day, or its month for a monthly interval, with the year when the period spans two. */
export function bucketLabels(
  groups: readonly (readonly Date[])[],
  interval: DateRangeValue["interval"],
): string[] {
  const years = new Set(
    groups.flatMap((group) => group.map((day) => day.getFullYear())),
  );
  return groups.map((group) => {
    const [first] = group;
    if (first === undefined) return "";
    if (interval !== "monthly") return DAY.format(first);
    return (years.size > 1 ? MONTH_AND_YEAR : MONTH).format(first);
  });
}

/** `measure` for the orders of each group of days. */
export function measured(
  measure: (orders: readonly Order[]) => number,
  groups: readonly (readonly Date[])[],
): number[] {
  return groups.map((group) => measure(group.flatMap((day) => ordersOn(day))));
}
