const dollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
const wholeDollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const shortDollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});
const count = new Intl.NumberFormat("en-US");
const day = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});
const dayAndTime = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});
const monthAndYear = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
});

export function money(value: number): string {
  return dollars.format(value);
}

export function roundMoney(value: number): string {
  return wholeDollars.format(value);
}

export function shortMoney(value: number): string {
  return shortDollars.format(value);
}

export function number(value: number): string {
  return count.format(value);
}

export function shortDate(date: Date): string {
  return day.format(date);
}

export function dateTime(date: Date): string {
  return dayAndTime.format(date);
}

export function since(date: Date): string {
  return monthAndYear.format(date);
}

export function kilograms(value: number): string {
  return `${count.format(value)} kg`;
}

/** The change from `before` to `now` as a fraction, or undefined when there was nothing before. */
export function change(now: number, before: number): number | undefined {
  return before === 0 ? undefined : (now - before) / before;
}
