import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

interface Frame {
  readonly t: number;
  readonly left: number;
  readonly height: number;
  readonly opacity: number;
  readonly translateY: number;
  readonly scale: number;
  readonly present: boolean;
  readonly settled: boolean;
}

type Channel = "left" | "height" | "opacity" | "translateY" | "scale";

interface Run {
  readonly before: Frame;
  readonly frames: readonly Frame[];
}

/** Presses `trigger`, then reads `target` on every frame for `duration` ms. */
async function sample(
  page: Page,
  trigger: string,
  target: string,
  duration = 900,
): Promise<Run> {
  return page.evaluate(
    async (options) => {
      const read = (t: number): Frame => {
        const settled =
          document.documentElement.hasAttribute("data-bt-settled");
        const element = document.querySelector(options.target);
        if (!element) {
          return {
            t,
            left: Number.NaN,
            height: Number.NaN,
            opacity: 0,
            translateY: 0,
            scale: 1,
            present: false,
            settled,
          };
        }
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        const matrix = new DOMMatrixReadOnly(style.transform);
        return {
          t,
          left: rect.left,
          height: rect.height,
          opacity: Number(style.opacity),
          translateY: matrix.f,
          scale: matrix.a,
          present: true,
          settled,
        };
      };
      const button = document.querySelector<HTMLElement>(options.trigger);
      if (!button) throw new Error(`Nothing matches ${options.trigger}`);
      const before = read(0);
      const frames: Frame[] = [];
      const start = performance.now();
      button.click();
      await new Promise<void>((resolve) => {
        const tick = (now: number): void => {
          frames.push(read(now - start));
          if (now - start < options.duration) requestAnimationFrame(tick);
          else resolve();
        };
        requestAnimationFrame(tick);
      });
      return { before, frames };
    },
    { trigger, target, duration },
  );
}

/** Each frame's share of the travel, from where the target first showed up to where it ended. */
function progress(run: Run, channel: Channel): readonly number[] {
  const last = run.frames.at(-1);
  const first = run.before.present
    ? run.before
    : run.frames.find((frame) => frame.present);
  if (!last || !first) throw new Error("no frames");
  const from = first[channel];
  const travel = last[channel] - from;
  if (!(Math.abs(travel) > 1e-3)) {
    const values = run.frames.map(
      (frame) => `${frame.t.toFixed(0)}ms ${frame[channel].toFixed(2)}`,
    );
    throw new Error(
      `${channel} didn't move from ${from.toFixed(2)}: ${values.join(", ")}`,
    );
  }
  return run.frames.map((frame) => (frame[channel] - from) / travel);
}

/** When 95% of the travel is done for good, in ms after the press. */
function settleTime(run: Run, channel: Channel): number {
  const values = progress(run, channel);
  let settled = run.frames.at(-1)?.t ?? 0;
  for (let index = values.length - 1; index >= 0; index -= 1) {
    const value = values[index];
    const frame = run.frames[index];
    if (value === undefined || !frame || value < 0.95) break;
    settled = frame.t;
  }
  return settled;
}

/** The farthest the value went past its target, as a share of the travel. */
function overshoot(run: Run, channel: Channel): number {
  return Math.max(...progress(run, channel)) - 1;
}

/** Frames caught between 5% and 95% of the travel. */
function framesBetween(run: Run, channel: Channel): number {
  return progress(run, channel).filter((value) => value > 0.05 && value < 0.95)
    .length;
}

/** From the first frame past 5% to the first frame past 95%. */
function span(run: Run, channel: Channel): number {
  const values = progress(run, channel);
  const from = values.findIndex((value) => value > 0.05);
  const to = values.findIndex((value) => value >= 0.95);
  const start = run.frames[from];
  const end = run.frames[to];
  if (!start || !end) throw new Error(`${channel} never got there`);
  return end.t - start.t;
}

/** When every animation buttery tracks has finished, in ms after the press. */
function finishTime(run: Run): number {
  const lastBusy = run.frames.findLastIndex((frame) => !frame.settled);
  const done = run.frames[lastBusy + 1];
  if (lastBusy === -1 || !done)
    throw new Error("nothing animated or it never finished");
  return done.t;
}

/** When the target left the page, in ms after the press. */
function goneTime(run: Run): number {
  const gone = run.frames.find((frame) => !frame.present);
  if (!gone) throw new Error("it never left");
  return gone.t;
}

function report(type: string, description: string): void {
  test.info().annotations.push({ type, description });
}

const testId = (id: string): string => `[data-testid="${id}"]`;
const INDICATOR = '[aria-label="Edge"] [data-bt-part="indicator"]';
const ms = (value: number): string => `${value.toFixed(0)}ms`;

/**
 * Settle-time windows (95% of travel) with a frame either side for sampling: rule 2's measured 230–300ms
 * for `spring.smooth`, §4.2's 350–400ms for `spring.morph`, and the `visualDuration` of the rest.
 */
const WINDOWS = {
  instant: [0, 34],
  snappy: [150, 230],
  smooth: [220, 310],
  morph: [340, 420],
  gentle: [340, 460],
} as const;

type Preset = "fade" | "rise" | "pop" | "toast" | "menu";

/** The transform each preset arrives with and the spring that drives it. */
const ARRIVALS: Readonly<
  Record<Exclude<Preset, "fade">, readonly [Channel, keyof typeof WINDOWS]>
> = {
  rise: ["translateY", "smooth"],
  pop: ["scale", "smooth"],
  toast: ["translateY", "snappy"],
  menu: ["scale", "snappy"],
};

const PRESETS: readonly Preset[] = ["fade", "rise", "pop", "toast", "menu"];

/** Exits fade over `dur-fast`: MOTION_SPEC §3 measured ~130ms out, ~120ms for a dialog closing. */
const EXIT_FADE_MAX = 140;
/** Then `AnimatePresence` unmounts the content, which can take a few more frames. */
const EXIT_GONE_MAX = 170;

test.describe("motion with full motion", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/?chrome=0&motion=full#/motion");
    await page.getByRole("heading", { name: "Motion", level: 1 }).waitFor();
  });

  for (const [token, [min, max]] of Object.entries(WINDOWS)) {
    test(`spring.${token} settles in ${String(min)}–${String(max)}ms`, async ({
      page,
    }) => {
      const run = await sample(
        page,
        testId(`spring-${token}-move`),
        testId(`spring-${token}`),
      );
      const settle = settleTime(run, "left");
      report(
        "settle",
        `spring.${token}: ${ms(settle)}, overshoot ${(overshoot(run, "left") * 100).toFixed(1)}%`,
      );
      expect(settle).toBeGreaterThanOrEqual(min);
      expect(settle).toBeLessThanOrEqual(max);
      if (token !== "gentle") expect(overshoot(run, "left")).toBeLessThan(0.01);
    });
  }

  test("Morph's height follows its content with spring.smooth", async ({
    page,
  }) => {
    const run = await sample(page, testId("morph-toggle"), testId("morph"));
    const settle = settleTime(run, "height");
    report("settle", `Morph height: ${ms(settle)}`);
    expect(settle).toBeGreaterThanOrEqual(WINDOWS.smooth[0]);
    expect(settle).toBeLessThanOrEqual(WINDOWS.smooth[1]);
    expect(overshoot(run, "height")).toBeLessThan(0.01);
  });

  test("the shared indicator slides with spring.snappy", async ({ page }) => {
    const run = await sample(page, testId("edge-Glow"), INDICATOR);
    const settle = settleTime(run, "left");
    report("settle", `SharedIndicator: ${ms(settle)}`);
    expect(settle).toBeGreaterThanOrEqual(WINDOWS.snappy[0]);
    expect(settle).toBeLessThanOrEqual(WINDOWS.snappy[1]);
  });

  for (const preset of PRESETS) {
    test(`the ${preset} preset arrives on time and leaves faster`, async ({
      page,
    }) => {
      const toggle = testId(`presence-${preset}-toggle`);
      const target = testId(`presence-${preset}`);
      const enter = await sample(page, toggle, target, 700);
      const exit = await sample(page, toggle, target, 400);
      const arrived = finishTime(enter);
      const left = goneTime(exit);
      const arrival = preset === "fade" ? undefined : ARRIVALS[preset];
      const moved = arrival ? settleTime(enter, arrival[0]) : undefined;
      report(
        "presence",
        `${preset}: ${moved === undefined ? "" : `transform ${ms(moved)}, `}opacity ${ms(settleTime(enter, "opacity"))}, done ${ms(arrived)}; exit ${ms(settleTime(exit, "opacity"))}, gone ${ms(left)}`,
      );
      if (arrival && moved !== undefined) {
        const [min, max] = WINDOWS[arrival[1]];
        expect(moved).toBeGreaterThanOrEqual(min);
        expect(moved).toBeLessThanOrEqual(max);
      }
      expect(settleTime(exit, "opacity")).toBeLessThanOrEqual(EXIT_FADE_MAX);
      expect(left).toBeLessThanOrEqual(EXIT_GONE_MAX);
      expect(left).toBeLessThan(arrived);
      expect(
        exit.frames.every(
          (frame) => frame.translateY === 0 && frame.scale === 1,
        ),
      ).toBe(true);
    });
  }

  test("confetti bursts and clears in about 900ms", async ({ page }) => {
    await page.getByTestId("celebrate").click();
    const pieces = page.locator('[data-bt="Confetti"] [data-bt-part="piece"]');
    expect(await pieces.count()).toBeGreaterThanOrEqual(24);
    await expect(pieces).toHaveCount(0, { timeout: 1500 });
  });
});

test.describe("motion with reduced motion", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/?chrome=0&motion=reduced#/motion");
    await page.getByRole("heading", { name: "Motion", level: 1 }).waitFor();
  });

  /** Lands in one step: no frame in between, within four frames of the press. */
  function expectInstant(run: Run, channel: Channel): void {
    expect(framesBetween(run, channel)).toBe(0);
    expect(settleTime(run, channel)).toBeLessThanOrEqual(67);
  }

  for (const token of Object.keys(WINDOWS)) {
    test(`spring.${token} lands at once`, async ({ page }) => {
      expectInstant(
        await sample(
          page,
          testId(`spring-${token}-move`),
          testId(`spring-${token}`),
          300,
        ),
        "left",
      );
    });
  }

  test("Morph and the indicator land at once", async ({ page }) => {
    expectInstant(
      await sample(page, testId("morph-toggle"), testId("morph"), 300),
      "height",
    );
    expectInstant(
      await sample(page, testId("edge-Glow"), INDICATOR, 300),
      "left",
    );
  });

  test("presets only fade, in 100ms or less", async ({ page }) => {
    for (const preset of PRESETS) {
      const toggle = testId(`presence-${preset}-toggle`);
      const target = testId(`presence-${preset}`);
      for (const run of [
        await sample(page, toggle, target, 300),
        await sample(page, toggle, target, 300),
      ]) {
        // A frame-sampled fade can't be timed closer than a frame; WebKit's whole-millisecond clock adds a few.
        expect(span(run, "opacity")).toBeLessThanOrEqual(105);
        expect(
          run.frames.every(
            (frame) => frame.translateY === 0 && frame.scale === 1,
          ),
        ).toBe(true);
      }
    }
  });

  test("confetti stays off", async ({ page }) => {
    await page.getByTestId("celebrate").click();
    await expect(
      page.locator('[data-bt="Confetti"] [data-bt-part="piece"]'),
    ).toHaveCount(0);
  });
});
