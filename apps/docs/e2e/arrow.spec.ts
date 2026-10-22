import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import {
  elementIds,
  finishSampling,
  fitTween,
  installSampler,
  progress,
  readingsOf,
  startSampling,
  traceOf,
} from "./sampling.ts";
import type { Curve, Reading, Run } from "./sampling.ts";

/** MOTION_SPEC §4.5: the stem grows and the head nudges 3px over `dur-fast` on `ease-out`, both ways. */
const EASE_OUT: Curve = [0.22, 1, 0.36, 1];
const CSS_EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";
const FAST = 120;
const NUDGE = 3;
/** With reduced motion the head stays where it rests, so the stem stops at its tip: 4 of its 7 units. */
const STILL_STEM = 4 / 7;
/** A fitted tween may miss its duration by 4ms (WebKit's clock counts whole milliseconds) and stray 3ms from its curve. */
const TWEEN_SLACK = 4;
const CURVE_ERROR = 3;
/** The arrow starts on the frame after the pointer arrives or leaves: one frame at 60Hz, with room for a busy machine. */
const START_MAX = 34;

const CONTROLS = ["arrow-button", "arrow-link"] as const;
type Control = (typeof CONTROLS)[number];

const control = (name: Control): string => `[data-testid="${name}"]`;

/** The control, its label and its arrow's box, which must never move, then the arrow's tip and stem. */
function partsOf(name: Control): string {
  const root = control(name);
  return [
    root,
    `${root} [data-bt-part="label"]`,
    `${root} [data-bt-part="arrow"]`,
    `${root} [data-bt-part="arrow-tip"]`,
    `${root} [data-bt-part="arrow-stem"]`,
  ].join(", ");
}

interface Parts {
  readonly still: readonly number[];
  readonly tip: number;
  readonly stem: number;
}

function partIds(run: Run): Parts {
  const [root, label, arrow, tip, stem] = elementIds(run);
  if (
    root === undefined ||
    label === undefined ||
    arrow === undefined ||
    tip === undefined ||
    stem === undefined
  ) {
    throw new Error("The control and its arrow weren't all sampled.");
  }
  return { still: [root, label, arrow], tip, stem };
}

async function open(page: Page, motion: "full" | "reduced"): Promise<void> {
  await installSampler(page);
  await page.goto(`/foundations/motion?chrome=0&motion=${motion}`);
  await page.getByRole("heading", { name: "Motion", level: 1 }).waitFor();
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

/** Moves the pointer onto the control's middle, or off to the page's corner, sampling its parts for 300ms. */
async function sampleHover(
  page: Page,
  name: Control,
  onto: boolean,
): Promise<Run> {
  const box = await page.locator(control(name)).boundingBox();
  if (!box) throw new Error("The control isn't on screen.");
  await startSampling(page, partsOf(name), [
    onto ? "pointerover" : "pointerout",
  ]);
  if (onto)
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  else await page.mouse.move(1, 1);
  return finishSampling(page, 300);
}

function transitionsOn(
  run: Run,
  id: number,
): readonly (readonly [string, number, string])[] {
  return run.transitions
    .filter((transition) => transition.id === id)
    .map(({ property, duration, easing }) => [property, duration, easing]);
}

const boxOf = (reading: Reading): readonly number[] => [
  reading.left,
  reading.top,
  reading.width,
  reading.height,
];

/** Each part in `ids` sits where it sat before the pointer moved, in every frame. */
function expectStill(run: Run, ids: readonly number[]): void {
  for (const id of ids) {
    const before = run.before.elements.find((reading) => reading.id === id);
    if (!before)
      throw new Error("A part wasn't there before the pointer moved.");
    for (const { reading } of readingsOf(run, id)) {
      expect(boxOf(reading)).toEqual(boxOf(before));
    }
  }
}

function lastOf(
  run: Run,
  id: number,
  pick: (reading: Reading) => number,
): number {
  const last = traceOf(run, id, pick).at(-1);
  if (!last) throw new Error("The part was never sampled.");
  return last.value;
}

for (const name of CONTROLS) {
  test.describe(`the ${name.replace("-", " ")}`, () => {
    test("grows its stem and nudges its head over dur-fast with ease-out, both ways, without moving", async ({
      page,
    }) => {
      await open(page, "full");
      await page.locator(control(name)).scrollIntoViewIfNeeded();
      await page.mouse.move(1, 1);

      for (const onto of [true, false]) {
        const run = await sampleHover(page, name, onto);
        const { still, tip, stem } = partIds(run);
        const moved = run.marks[onto ? "pointerover" : "pointerout"];
        if (moved === undefined) throw new Error("The pointer never moved.");
        expect(transitionsOn(run, stem)).toEqual([
          ["scale", FAST, CSS_EASE_OUT],
        ]);
        expect(transitionsOn(run, tip)).toEqual([
          ["translate", FAST, CSS_EASE_OUT],
        ]);
        const [from, to]: readonly [number, number] = onto ? [0, 1] : [1, 0];
        const growth = fitTween(
          progress(
            traceOf(run, stem, (reading) => reading.scale),
            from,
            to,
          ),
          EASE_OUT,
        );
        const nudge = fitTween(
          progress(
            traceOf(run, tip, (reading) => reading.x),
            (from - 1) * NUDGE,
            (to - 1) * NUDGE,
          ),
          EASE_OUT,
        );
        test.info().annotations.push({
          type: "arrow",
          description: `${onto ? "in" : "out"}: stem ${growth.duration.toFixed(1)}ms from ${(growth.start - moved).toFixed(1)}ms (±${growth.error.toFixed(1)}), head ${nudge.duration.toFixed(1)}ms from ${(nudge.start - moved).toFixed(1)}ms (±${nudge.error.toFixed(1)})`,
        });
        for (const fit of [growth, nudge]) {
          expect(Math.abs(fit.duration - FAST)).toBeLessThanOrEqual(
            TWEEN_SLACK,
          );
          expect(fit.error).toBeLessThanOrEqual(CURVE_ERROR);
          expect(fit.start - moved).toBeLessThanOrEqual(START_MAX);
        }
        expect(Math.abs(growth.start - nudge.start)).toBeLessThanOrEqual(
          TWEEN_SLACK,
        );
        expect(lastOf(run, stem, (reading) => reading.scale)).toBe(to);
        expect(lastOf(run, tip, (reading) => reading.x)).toBe((to - 1) * NUDGE);
        expectStill(run, still);
      }
    });

    test("turns its chevron into an arrow at once, without the nudge, with reduced motion", async ({
      page,
    }) => {
      await open(page, "reduced");
      await page.locator(control(name)).scrollIntoViewIfNeeded();
      await page.mouse.move(1, 1);
      const run = await sampleHover(page, name, true);
      const { still, tip, stem } = partIds(run);
      expect(transitionsOn(run, stem)).toEqual([]);
      expect(transitionsOn(run, tip)).toEqual([]);
      const scales = traceOf(run, stem, (reading) => reading.scale);
      for (const { value } of scales) {
        expect(
          [0, STILL_STEM].some((end) => Math.abs(value - end) < 1e-3),
        ).toBe(true);
      }
      expect(scales.at(-1)?.value).toBeCloseTo(STILL_STEM, 3);
      for (const { value } of traceOf(run, tip, (reading) => reading.x)) {
        expect(value).toBe(-NUDGE);
      }
      expectStill(run, still);
    });
  });
}

test("a tap leaves the chevron alone on a touchscreen", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    ...(baseURL === undefined ? {} : { baseURL }),
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await open(page, "full");
  expect(await page.evaluate(() => matchMedia("(hover: hover)").matches)).toBe(
    false,
  );
  const button = page.locator(control("arrow-button"));
  await button.tap();
  await page.waitForTimeout(250);
  expect(await button.evaluate((element) => element.matches(":hover"))).toBe(
    true,
  );
  const [scale, offset] = await button.evaluate((element) => {
    const tip = element.querySelector('[data-bt-part="arrow-tip"]');
    const stem = element.querySelector('[data-bt-part="arrow-stem"]');
    if (!tip || !stem) throw new Error("The button has no arrow.");
    return [
      Number.parseFloat(getComputedStyle(stem).scale),
      Number.parseFloat(getComputedStyle(tip).translate),
    ];
  });
  expect([scale, offset]).toEqual([0, -NUDGE]);
  await context.close();
});
