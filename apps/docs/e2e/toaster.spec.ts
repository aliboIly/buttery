import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import {
  elementIds,
  finishSampling,
  fitSpring,
  fitTween,
  framesBetween,
  goneAt,
  installSampler,
  overshoot,
  progress,
  readingsOf,
  startSampling,
  traceOf,
} from "./sampling.ts";
import type { Curve, Point, Reading, Run, SpringSpec } from "./sampling.ts";

/**
 * MOTION_SPEC §3 and DESIGN_SPEC: a toast rises 8px on `spring.snappy` with a `dur-base` fade and leaves
 * with a `dur-fast` fade; one arriving under others rises a whole step on the spring the stack moves up
 * with. Toasts are 36px tall, 8px apart, 24px above the bottom edge.
 */
const SNAPPY: SpringSpec = { visualDuration: 0.18, bounce: 0 };
const EASE_OUT: Curve = [0.22, 1, 0.36, 1];
const EASE_IN: Curve = [0.4, 0, 1, 1];
const LINEAR: Curve = [0, 0, 1, 1];
const RISE = 8;
const HEIGHT = 36;
const GAP = 8;
const EDGE = 24;
const FADE_IN = 200;
const FADE_OUT = 120;
const REDUCED_FADE = 100;
/** A fitted spring may miss its visual duration by 3% and a tween its duration by 4ms; frames may stray 3ms. */
const SPRING_SLACK = 0.03;
const TWEEN_SLACK = 4;
const CURVE_ERROR = 3;
/** One frame at 60Hz. */
const FRAME = 17;
/**
 * Motion starts a layout animation on the frame after the commit, so the stack follows the newcomer by
 * one frame; half a frame more allows for the clock, and two frames would fail.
 */
const STACK_LAG = 25;

const TOASTS = '.bt-toaster > [data-bt-part="list"] > [data-bt-part="toast"]';
const PILLS = `${TOASTS} > [data-bt-part="pill"]`;
const SAMPLED = `${TOASTS}, ${PILLS}`;

/** A sampled toast: the item, which fades and keeps its place in the stack, and its pill, which rises. */
interface SampledToast {
  readonly item: number;
  readonly pill: number;
}

/** The toasts seen in the run, oldest first: each item comes just before its pill in document order. */
function toastsIn(run: Run): readonly SampledToast[] {
  const ids = elementIds(run);
  return ids.flatMap((item, index) => {
    const pill = ids[index + 1];
    return index % 2 === 0 && pill !== undefined ? [{ item, pill }] : [];
  });
}

/** The pills in each frame, for where toasts show. */
function pillsOf(run: Run, toasts: readonly SampledToast[]): Run {
  const pills = new Set(toasts.map(({ pill }) => pill));
  return {
    ...run,
    frames: run.frames.map((frame) => ({
      ...frame,
      elements: frame.elements.filter(({ id }) => pills.has(id)),
    })),
  };
}

function report(description: string): void {
  test.info().annotations.push({ type: "toast", description });
}

async function open(page: Page, motion: "full" | "reduced"): Promise<void> {
  await installSampler(page);
  await page.goto(`/components/toaster?chrome=0&motion=${motion}`);
  await page.getByRole("heading", { name: "Toaster", level: 1 }).waitFor();
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

async function showToast(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Show a toast", exact: true }).click();
}

/** Waits until `count` toasts show and nothing moves. */
async function settled(page: Page, count: number): Promise<void> {
  await expect(page.locator(`${TOASTS}[data-state="open"]`)).toHaveCount(count);
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        const check = (): void => {
          if (document.documentElement.hasAttribute("data-bt-settled")) {
            resolve();
          } else requestAnimationFrame(check);
        };
        requestAnimationFrame(() => {
          requestAnimationFrame(check);
        });
      }),
  );
}

function expectSnappy(label: string, points: readonly Point[]): number {
  const fit = fitSpring(points, SNAPPY);
  report(
    `${label}: a ${fit.visualDuration.toFixed(3)}s spring (snappy is 0.18s), within ${fit.error.toFixed(1)}ms`,
  );
  expect(
    Math.abs(fit.visualDuration / SNAPPY.visualDuration - 1),
  ).toBeLessThanOrEqual(SPRING_SLACK);
  expect(fit.error).toBeLessThanOrEqual(CURVE_ERROR);
  expect(overshoot(points)).toBeLessThan(0.01);
  return fit.start;
}

function expectTween(
  label: string,
  points: readonly Point[],
  curve: Curve,
  duration: number,
): number {
  const fit = fitTween(points, curve);
  report(
    `${label}: ${fit.duration.toFixed(1)}ms (${String(duration)}ms wanted), within ${fit.error.toFixed(1)}ms`,
  );
  expect(Math.abs(fit.duration - duration)).toBeLessThanOrEqual(TWEEN_SLACK);
  expect(fit.error).toBeLessThanOrEqual(CURVE_ERROR);
  return fit.start;
}

function readingAtEnd(run: Run, id: number): Reading {
  const last = readingsOf(run, id).at(-1);
  if (!last) throw new Error("The toast was never sampled.");
  return last.reading;
}

/** No two toasts cover each other in any frame, the leaving one included. */
function expectNoOverlap(run: Run): void {
  for (const { t, elements } of run.frames) {
    const sorted = [...elements].sort((a, b) => a.top - b.top);
    for (const [index, lower] of sorted.entries()) {
      const upper = sorted[index - 1];
      if (!upper) continue;
      const overlap = upper.top + upper.height - lower.top;
      if (overlap > 0.5) {
        throw new Error(
          `Two toasts overlap by ${overlap.toFixed(1)}px at ${t.toFixed(0)}ms.`,
        );
      }
    }
  }
}

test.describe("toasts", () => {
  test("a toast rises 8px on spring.snappy with a dur-base fade, 24px above the bottom, and fades out where it is", async ({
    page,
  }) => {
    await open(page, "full");
    await startSampling(page, SAMPLED);
    await showToast(page);
    const arrival = await finishSampling(page, 600);
    const [toast] = toastsIn(arrival);
    if (!toast) throw new Error("No toast arrived.");
    const rise = expectSnappy(
      "rise",
      progress(
        traceOf(arrival, toast.pill, (reading) => reading.y),
        RISE,
        0,
      ),
    );
    const fade = expectTween(
      "fade in",
      progress(
        traceOf(arrival, toast.item, (reading) => reading.opacity),
        0,
        1,
      ),
      EASE_OUT,
      FADE_IN,
    );
    expect(Math.abs(rise - fade)).toBeLessThanOrEqual(FRAME);
    const viewport = page.viewportSize();
    if (!viewport) throw new Error("No viewport.");
    const rest = readingAtEnd(arrival, toast.pill);
    expect(rest.height).toBe(HEIGHT);
    expect(viewport.height - (rest.top + rest.height)).toBe(EDGE);
    expect(
      Math.abs(rest.left + rest.width / 2 - viewport.width / 2),
    ).toBeLessThanOrEqual(0.5);

    await startSampling(page, SAMPLED);
    await page
      .getByRole("button", { name: "Dismiss all", exact: true })
      .click();
    const departure = await finishSampling(page, 400);
    const leaving = expectTween(
      "fade out",
      progress(
        traceOf(departure, toast.item, (reading) => reading.opacity),
        1,
        0,
      ),
      EASE_IN,
      FADE_OUT,
    );
    for (const { reading } of readingsOf(departure, toast.pill)) {
      expect([reading.left, reading.top, reading.y]).toEqual([
        rest.left,
        rest.top,
        0,
      ]);
    }
    expect(goneAt(departure, toast.item)).toBeLessThanOrEqual(
      leaving + FADE_OUT + 3 * FRAME,
    );
  });

  test("a toast arriving under others pushes the stack up as one column, and the oldest fades out at the top", async ({
    page,
  }) => {
    await open(page, "full");
    for (const count of [1, 2, 3]) {
      await showToast(page);
      await settled(page, count);
    }
    await startSampling(page, SAMPLED);
    await showToast(page);
    const run = await finishSampling(page, 600);
    const toasts = toastsIn(run);
    const [oldest, second, third, newest] = toasts;
    if (!oldest || !second || !third || !newest) {
      throw new Error("Expected three toasts and a fourth.");
    }
    expectNoOverlap(pillsOf(run, toasts));
    const pushed = expectSnappy(
      "newcomer",
      progress(
        traceOf(run, newest.pill, (reading) => reading.y),
        HEIGHT + GAP,
        0,
      ),
    );
    for (const [label, toast] of [
      ["second", second],
      ["third", third],
    ] as const) {
      const tops = traceOf(run, toast.pill, (reading) => reading.top);
      const from = tops[0]?.value ?? Number.NaN;
      const start = expectSnappy(
        `${label} moving up`,
        progress(tops, from, from - HEIGHT - GAP),
      );
      expect(Math.abs(start - pushed)).toBeLessThanOrEqual(STACK_LAG);
    }
    const faded = expectTween(
      "oldest fading out",
      progress(
        traceOf(run, oldest.item, (reading) => reading.opacity),
        1,
        0,
      ),
      EASE_IN,
      FADE_OUT,
    );
    expect(goneAt(run, oldest.item)).toBeLessThanOrEqual(
      faded + FADE_OUT + 3 * FRAME,
    );
    const viewport = page.viewportSize();
    if (!viewport) throw new Error("No viewport.");
    for (const { elements } of pillsOf(run, toasts).frames) {
      for (const reading of elements) {
        expect(reading.top).toBeGreaterThanOrEqual(0);
        expect(reading.left).toBeGreaterThanOrEqual(EDGE);
        expect(reading.left + reading.width).toBeLessThanOrEqual(
          viewport.width - EDGE,
        );
      }
    }
    const rest = [second, third, newest].map(({ pill }) =>
      readingAtEnd(run, pill),
    );
    expect(
      rest.slice(1).map((reading, index) => {
        const above = rest[index];
        return above ? reading.top - (above.top + above.height) : Number.NaN;
      }),
    ).toEqual([GAP, GAP]);
    const last = rest.at(-1);
    expect(last && viewport.height - (last.top + last.height)).toBe(EDGE);
  });

  test("a toast leaving the middle fades where it is, then the toast above closes the gap on spring.snappy", async ({
    page,
  }) => {
    await open(page, "full");
    for (const count of [1, 2, 3]) {
      await showToast(page);
      await settled(page, count);
    }
    await page.locator(TOASTS).nth(1).focus();
    await startSampling(page, SAMPLED);
    await page.keyboard.press("Escape");
    const run = await finishSampling(page, 700);
    const toasts = toastsIn(run);
    const [top, middle, bottom] = toasts;
    if (!top || !middle || !bottom) throw new Error("Expected three toasts.");
    expectNoOverlap(pillsOf(run, toasts));
    const faded = expectTween(
      "middle fading out",
      progress(
        traceOf(run, middle.item, (reading) => reading.opacity),
        1,
        0,
      ),
      EASE_IN,
      FADE_OUT,
    );
    const resting = readingAtEnd(run, middle.pill);
    for (const { reading } of readingsOf(run, middle.pill)) {
      expect([reading.top, reading.left]).toEqual([resting.top, resting.left]);
    }
    const gone = goneAt(run, middle.item);
    const tops = traceOf(run, top.pill, (reading) => reading.top);
    const from = tops[0]?.value ?? Number.NaN;
    expect(
      tops.filter(({ t }) => t < gone).every(({ value }) => value === from),
    ).toBe(true);
    const closing = expectSnappy(
      "top closing the gap",
      progress(tops, from, from + HEIGHT + GAP),
    );
    expect(closing).toBeGreaterThanOrEqual(faded + FADE_OUT - FRAME);
    const below = traceOf(run, bottom.pill, (reading) => reading.top);
    expect(new Set(below.map(({ value }) => value)).size).toBe(1);
  });

  test("a toast updated by id changes in place: nothing moves or overlaps", async ({
    page,
  }) => {
    await open(page, "full");
    await page
      .getByRole("button", { name: "Start the upload", exact: true })
      .click();
    await settled(page, 1);
    await showToast(page);
    await settled(page, 2);
    await startSampling(page, SAMPLED);
    await page.getByRole("button", { name: "Finish it", exact: true }).click();
    const run = await finishSampling(page, 400);
    const toasts = toastsIn(run);
    expect(toasts).toHaveLength(2);
    expectNoOverlap(pillsOf(run, toasts));
    for (const { pill } of toasts) {
      const tops = traceOf(run, pill, (reading) => reading.top);
      expect(new Set(tops.map(({ value }) => value)).size).toBe(1);
    }
    await expect(page.locator(TOASTS).first()).toContainText(
      "3 photos uploaded",
    );
  });

  test("a swipe down closes a toast, and a short one lets it spring back", async ({
    page,
  }) => {
    await open(page, "full");
    await showToast(page);
    await settled(page, 1);
    const toast = page.locator(TOASTS);
    const box = await toast.boundingBox();
    if (!box) throw new Error("The toast isn't on screen.");
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x, y + 20, { steps: 5 });
    expect(
      await toast.evaluate((element) => getComputedStyle(element).translate),
    ).toBe("0px 20px");
    await page.mouse.up();
    await expect
      .poll(() =>
        toast.evaluate((element) => getComputedStyle(element).translate),
      )
      .toBe("none");
    await expect(toast).toHaveAttribute("data-state", "open");
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x, y + 80, { steps: 8 });
    await page.mouse.up();
    await expect(toast).toHaveCount(0);
  });

  test("with reduced motion a toast only fades in, and the stack jumps to its new places", async ({
    page,
  }) => {
    await open(page, "reduced");
    for (const count of [1, 2]) {
      await showToast(page);
      await settled(page, count);
    }
    await startSampling(page, SAMPLED);
    await showToast(page);
    const run = await finishSampling(page, 400);
    const toasts = toastsIn(run);
    const [first, second, newest] = toasts;
    if (!first || !second || !newest) {
      throw new Error("Expected two toasts and a third.");
    }
    for (const { reading } of readingsOf(run, newest.pill)) {
      expect(reading.y).toBe(0);
    }
    expectTween(
      "reduced fade in",
      progress(
        traceOf(run, newest.item, (reading) => reading.opacity),
        0,
        1,
      ),
      LINEAR,
      REDUCED_FADE,
    );
    for (const { pill } of [first, second]) {
      const tops = traceOf(run, pill, (reading) => reading.top);
      const from = tops[0]?.value ?? Number.NaN;
      expect(framesBetween(progress(tops, from, from - HEIGHT - GAP))).toBe(0);
    }
    expectNoOverlap(pillsOf(run, toasts));
  });
});
