import { describe, expect, it } from "vitest";
import { alignedBuckets, buckets } from "./period.ts";

function days(from: Date, count: number): Date[] {
  return Array.from(
    { length: count },
    (_, index) =>
      new Date(from.getFullYear(), from.getMonth(), from.getDate() + index),
  );
}

describe("buckets", () => {
  it("plots whole weeks counted back from the last day, leaving out a part week at the start", () => {
    const period = days(new Date(2026, 6, 21), 92);
    const groups = buckets(period, "weekly");
    expect(groups.every((group) => group.length === 7)).toBe(true);
    expect(groups.at(-1)?.at(-1)).toEqual(period.at(-1));
  });

  it("keeps a period shorter than a week as one point", () => {
    expect(buckets(days(new Date(2026, 9, 21), 1), "weekly")).toHaveLength(1);
  });

  it("starts monthly points at the first whole month and keeps the month to date at the end", () => {
    const period = days(new Date(2025, 9, 22), 365);
    const groups = buckets(period, "monthly");
    expect(groups.every((group) => group[0]?.getDate() === 1)).toBe(true);
    expect(groups.at(-1)?.at(-1)).toEqual(period.at(-1));
  });
});

describe("alignedBuckets", () => {
  it("lines the comparison's groups up from the end, so a left-out first week is left out of both", () => {
    const period = days(new Date(2026, 6, 21), 92);
    const before = days(new Date(2026, 3, 20), 92);
    const groups = buckets(period, "weekly");
    const aligned = alignedBuckets(groups, before);
    expect(aligned.map((group) => group.length)).toEqual(
      groups.map((group) => group.length),
    );
    expect(aligned.at(-1)?.at(-1)).toEqual(before.at(-1));
  });
});
