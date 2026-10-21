import { describe, expect, it } from "vitest";
import { runs, seriesPath, smoothPath, valueScale } from "./chart-scale.ts";

describe("valueScale", () => {
  it("starts at zero and ends on a round number past the largest value", () => {
    expect(valueScale([42, 38, 71, 58], 4)).toEqual({
      min: 0,
      max: 80,
      ticks: [0, 20, 40, 60, 80],
      decimals: 0,
    });
  });

  it("takes in negative values with zero among its ticks", () => {
    const scale = valueScale([-120, 340], 4);
    expect(scale.min).toBeLessThanOrEqual(-120);
    expect(scale.max).toBeGreaterThanOrEqual(340);
    expect(scale.ticks).toContain(0);
  });

  it("keeps decimal steps exact", () => {
    expect(valueScale([0.07, 0.31], 4).ticks).toEqual([0, 0.1, 0.2, 0.3, 0.4]);
  });

  it("keeps counts on whole numbers, in steps of 1, 2 or 5 times a power of ten", () => {
    expect(valueScale([0, 1, 2, 1], 4).ticks).toEqual([0, 1, 2]);
    expect(valueScale([0, 10], 4).ticks).toEqual([0, 5, 10]);
    expect(valueScale([3, 5], 2).ticks).toEqual([0, 5]);
    for (const tick of valueScale([12, 37, 68], 4).ticks)
      expect(Number.isInteger(tick)).toBe(true);
  });

  it("says how many decimals its ticks need", () => {
    expect(valueScale([0.2, 1], 4)).toMatchObject({
      ticks: [0, 0.25, 0.5, 0.75, 1],
      decimals: 2,
    });
    expect(valueScale([0.004, 0.019], 4).decimals).toBe(3);
    expect(valueScale([1200, 9800], 4).decimals).toBe(0);
  });

  it("leaves out values that aren't finite numbers", () => {
    expect(valueScale([4, Number.NaN, 9, Number.POSITIVE_INFINITY], 4)).toEqual(
      valueScale([4, 9], 4),
    );
  });

  it("gives one tick at zero for no values or all zeros", () => {
    expect(valueScale([], 4)).toEqual({
      min: 0,
      max: 1,
      ticks: [0],
      decimals: 0,
    });
    expect(valueScale([0, 0], 4)).toEqual({
      min: 0,
      max: 1,
      ticks: [0],
      decimals: 0,
    });
  });

  it("spaces its ticks evenly", () => {
    const { ticks } = valueScale([3, 1290, 870], 5);
    const steps = ticks
      .slice(1)
      .map((tick, index) => tick - (ticks[index] ?? 0));
    expect(new Set(steps).size).toBe(1);
  });
});

describe("smoothPath", () => {
  it("draws one or two points straight", () => {
    expect(smoothPath([])).toBe("");
    expect(smoothPath([{ x: 0, y: 50 }])).toBe("M0 50");
    expect(
      smoothPath([
        { x: 0, y: 50 },
        { x: 100, y: 20 },
      ]),
    ).toBe("M0 50L100 20");
  });

  it("keeps a run of equal values flat", () => {
    const path = smoothPath([
      { x: 0, y: 40 },
      { x: 50, y: 40 },
      { x: 100, y: 40 },
    ]);
    const ys = [...path.matchAll(/(-?[\d.]+) (-?[\d.]+)/g)].map(
      (match) => match[2],
    );
    expect(new Set(ys)).toEqual(new Set(["40"]));
  });

  it("never bends past a peak", () => {
    const path = smoothPath([
      { x: 0, y: 80 },
      { x: 25, y: 20 },
      { x: 50, y: 70 },
      { x: 75, y: 60 },
      { x: 100, y: 90 },
    ]);
    const ys = [...path.matchAll(/(-?[\d.]+) (-?[\d.]+)/g)].map((match) =>
      Number(match[2]),
    );
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(20);
    expect(Math.max(...ys)).toBeLessThanOrEqual(90);
  });
});

describe("runs and seriesPath", () => {
  it("split a series at its gaps", () => {
    expect(runs([1, 2, null, 4, null, null])).toEqual([
      [
        { index: 0, value: 1 },
        { index: 1, value: 2 },
      ],
      [{ index: 3, value: 4 }],
    ]);
    const path = seriesPath([1, 2, null, 4, 5], {
      x: (index) => index * 25,
      y: (value) => 100 - value * 10,
    });
    expect(path.match(/M/g)).toHaveLength(2);
  });
});
