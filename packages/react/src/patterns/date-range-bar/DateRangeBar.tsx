import { Stack, Text, cx, useControllableState } from "@buttery/core";
import { useState } from "react";
import type { ComponentPropsWithRef, ReactElement } from "react";
import { Select } from "../../components/select/Select.tsx";
import type { SelectOption } from "../../components/select/Select.tsx";
import { TextField } from "../../components/text-field/TextField.tsx";

/** A preset range ending today, or `"custom"` for two dates of one's own. */
export type DateRangePreset =
  | "today"
  | "last-7-days"
  | "last-4-weeks"
  | "last-3-months"
  | "last-12-months"
  | "month-to-date"
  | "year-to-date"
  | "custom";

/** How a report's charts group their points. */
export type DateInterval = "daily" | "weekly" | "monthly";

/** What a report's period is compared with. */
export type DateComparison = "previous-period" | "previous-year" | "none";

/** Two dates as ISO strings, such as `"2026-10-01"`, the end on or after the start. */
export interface CustomDateRange {
  /** The first day, as `YYYY-MM-DD`. */
  readonly start: string;
  /** The last day, as `YYYY-MM-DD`. */
  readonly end: string;
}

/** Everything a `DateRangeBar` is set to, for fetching a report's data. */
export interface DateRangeValue {
  /** The range: a preset ending today, or `"custom"`. */
  readonly range: DateRangePreset;
  /** The dates of a `"custom"` range. */
  readonly custom?: CustomDateRange | undefined;
  /** How the charts group their points. */
  readonly interval: DateInterval;
  /** What the period is compared with. */
  readonly comparison: DateComparison;
}

/** The words a `DateRangeBar` shows and announces. */
export interface DateRangeBarLabels {
  /** Names the range select. */
  readonly range: string;
  /** Names the interval select. */
  readonly interval: string;
  /** Names the comparison select. */
  readonly comparison: string;
  /** The caption before the comparison select. */
  readonly comparedTo: string;
  /** Names the custom range fields under the range list. */
  readonly customRange: string;
  /** Labels the first date field. */
  readonly start: string;
  /** Labels the last date field. */
  readonly end: string;
  /** Each range's name in the list. */
  readonly presets: Readonly<Record<DateRangePreset, string>>;
  /** Each interval's name in the list. */
  readonly intervals: Readonly<Record<DateInterval, string>>;
  /** Each comparison's name in the list. */
  readonly comparisons: Readonly<Record<DateComparison, string>>;
}

/** Props for `DateRangeBar`. */
export interface DateRangeBarProps extends Omit<
  ComponentPropsWithRef<"div">,
  "defaultValue"
> {
  /** What it's set to, when you control it. */
  readonly value?: DateRangeValue | undefined;
  /** What it starts at. Defaults to the last 7 days, daily, against the previous period. */
  readonly defaultValue?: DateRangeValue | undefined;
  /** Called with everything it's set to whenever one part changes. */
  readonly onValueChange?: ((value: DateRangeValue) => void) | undefined;
  /** Names the group. Defaults to `"Period"`. */
  readonly label?: string | undefined;
  /** Its words, for another language or your own names. */
  readonly labels?: Partial<DateRangeBarLabels> | undefined;
  /** Writes a custom range on the range select. Defaults to the short month and days, such as "Oct 1 – 14". */
  readonly formatRange?: ((range: CustomDateRange) => string) | undefined;
}

const LABELS: DateRangeBarLabels = {
  range: "Date range",
  interval: "Interval",
  comparison: "Comparison",
  comparedTo: "compared to",
  customRange: "Custom range",
  start: "Start",
  end: "End",
  presets: {
    today: "Today",
    "last-7-days": "Last 7 days",
    "last-4-weeks": "Last 4 weeks",
    "last-3-months": "Last 3 months",
    "last-12-months": "Last 12 months",
    "month-to-date": "Month to date",
    "year-to-date": "Year to date",
    custom: "Custom",
  },
  intervals: { daily: "Daily", weekly: "Weekly", monthly: "Monthly" },
  comparisons: {
    "previous-period": "Previous period",
    "previous-year": "Previous year",
    none: "No comparison",
  },
};

const DEFAULT_VALUE: DateRangeValue = {
  range: "last-7-days",
  interval: "daily",
  comparison: "previous-period",
};

const PRESETS: readonly DateRangePreset[] = [
  "today",
  "last-7-days",
  "last-4-weeks",
  "last-3-months",
  "last-12-months",
  "month-to-date",
  "year-to-date",
  "custom",
];
const INTERVALS: readonly DateInterval[] = ["daily", "weekly", "monthly"];
const COMPARISONS: readonly DateComparison[] = [
  "previous-period",
  "previous-year",
  "none",
];

const NO_DATES: CustomDateRange = { start: "", end: "" };

function options<Value extends string>(
  values: readonly Value[],
  names: Readonly<Record<Value, string>>,
): SelectOption<Value>[] {
  return values.map((value) => ({ value, label: names[value] }));
}

function isoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${String(date.getFullYear())}-${month}-${day}`;
}

/** The local calendar day an ISO date names, so a range never shifts by a time zone. */
function dayOf(iso: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (match === null) return undefined;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function formatCustom(range: CustomDateRange): string {
  const start = dayOf(range.start);
  const end = dayOf(range.end);
  if (start === undefined || end === undefined)
    return `${range.start} – ${range.end}`;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    ...(start.getFullYear() === end.getFullYear() ? {} : { year: "numeric" }),
  }).formatRange(start, end);
}

/** The two dates in order, so a range typed end first still runs forward. */
function ordered(range: CustomDateRange): CustomDateRange {
  return range.start <= range.end
    ? range
    : { start: range.end, end: range.start };
}

function sameDates(
  a: CustomDateRange | undefined,
  b: CustomDateRange | undefined,
): boolean {
  return a?.start === b?.start && a?.end === b?.end;
}

/**
 * The period a report covers, as three small outline selects 8 apart: the range (presets ending today,
 * or two dates in fields under its list), the interval its charts group by, and, after "compared to", the
 * period it's set against. One value holds all of it, for fetching the report's data. It fills the width
 * it's given, and under 640px of it the range and interval share a row over the comparison.
 *
 * @example
 * <DateRangeBar value={period} onValueChange={setPeriod} />
 */
export function DateRangeBar({
  value,
  defaultValue = DEFAULT_VALUE,
  onValueChange,
  label = "Period",
  labels,
  formatRange = formatCustom,
  className,
  ...rest
}: DateRangeBarProps): ReactElement {
  const [current, setCurrent] = useControllableState<DateRangeValue>({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  const words = { ...LABELS, ...labels };
  const applied = current.range === "custom" ? current.custom : undefined;
  const [draft, setDraft] = useState<CustomDateRange>(applied ?? NO_DATES);
  const [synced, setSynced] = useState(applied);

  // Dates typed end first are applied in order but stay in the fields as typed, until the range changes.
  if (!sameDates(applied, synced)) {
    setSynced(applied);
    if (!sameDates(applied, ordered(draft))) setDraft(applied ?? NO_DATES);
  }

  const editDates = (next: CustomDateRange): void => {
    setDraft(next);
    if (next.start !== "" && next.end !== "")
      setCurrent({ ...current, range: "custom", custom: ordered(next) });
  };

  const chooseRange = (range: DateRangePreset): void => {
    if (range !== "custom") {
      setCurrent({ ...current, range, custom: undefined });
      return;
    }
    if (draft.start !== "" && draft.end !== "") {
      const dates = ordered(draft);
      setDraft(dates);
      setCurrent({ ...current, range, custom: dates });
      return;
    }
    const end = new Date();
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    const week = { start: isoDate(start), end: isoDate(end) };
    setDraft(week);
    setCurrent({ ...current, range, custom: week });
  };

  return (
    <div
      role="group"
      aria-label={label}
      {...rest}
      className={cx("bt-date-range-bar", className)}
      data-bt="DateRangeBar"
    >
      <div data-bt-part="controls">
        <span data-bt-part="range">
          <Select<DateRangePreset>
            label={words.range}
            options={options(PRESETS, words.presets)}
            value={current.range}
            valueLabel={
              applied === undefined ? undefined : formatRange(applied)
            }
            onValueChange={chooseRange}
            variant="outline"
            size="sm"
            footerLabel={words.customRange}
            footer={
              <Stack gap={2}>
                <TextField
                  type="date"
                  label={words.start}
                  value={draft.start}
                  max={draft.end === "" ? undefined : draft.end}
                  onValueChange={(start) => {
                    editDates({ ...draft, start });
                  }}
                />
                <TextField
                  type="date"
                  label={words.end}
                  value={draft.end}
                  min={draft.start === "" ? undefined : draft.start}
                  onValueChange={(end) => {
                    editDates({ ...draft, end });
                  }}
                />
              </Stack>
            }
          />
        </span>
        <span data-bt-part="interval">
          <Select<DateInterval>
            label={words.interval}
            options={options(INTERVALS, words.intervals)}
            value={current.interval}
            onValueChange={(interval) => {
              setCurrent({ ...current, interval });
            }}
            variant="outline"
            size="sm"
          />
        </span>
        <span data-bt-part="compare">
          <Text variant="caption" aria-hidden="true">
            {words.comparedTo}
          </Text>
          <span data-bt-part="comparison">
            <Select<DateComparison>
              label={words.comparison}
              options={options(COMPARISONS, words.comparisons)}
              value={current.comparison}
              onValueChange={(comparison) => {
                setCurrent({ ...current, comparison });
              }}
              variant="outline"
              size="sm"
            />
          </span>
        </span>
      </div>
    </div>
  );
}
