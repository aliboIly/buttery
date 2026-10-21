import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
import {
  elementIds,
  finishSampling,
  peek,
  waitUntilMoved,
  fitSpring,
  fitTween,
  framesBetween,
  goneAt,
  installSampler,
  markSample,
  overshoot,
  progress,
  readingsOf,
  sampleClick,
  settledAt,
  settleTime,
  springSettle,
  startSampling,
  trace,
  traceOf,
} from "./sampling.ts";
import type {
  Channel,
  Curve,
  Fit,
  Point,
  Reading,
  Run,
  SpringSpec,
} from "./sampling.ts";

/** The springs in MOTION_SPEC §2. */
const SPRINGS = {
  snappy: { visualDuration: 0.18, bounce: 0 },
  smooth: { visualDuration: 0.25, bounce: 0 },
  morph: { visualDuration: 0.38, bounce: 0 },
  gentle: { visualDuration: 0.45, bounce: 0.08 },
} as const satisfies Record<string, SpringSpec>;

type SpringName = keyof typeof SPRINGS;

const SPRING_NAMES = Object.keys(SPRINGS) as readonly SpringName[];

/** The easing curves and durations in MOTION_SPEC §2, in ms. */
const EASE_OUT: Curve = [0.22, 1, 0.36, 1];
const EASE_IN: Curve = [0.4, 0, 1, 1];
const EASE_STANDARD: Curve = [0.2, 0, 0, 1];
const LINEAR: Curve = [0, 0, 1, 1];
const CSS_EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";
const CSS_EASE_STANDARD = "cubic-bezier(0.2, 0, 0, 1)";
const DURATIONS = { press: 80, reduced: 100, fast: 120, base: 200 } as const;
const STAGGER = 50;
const ENTRANCE_MAX = 900;
const LOOP_CYCLE = 4000;
const CELEBRATION = 900;

/** How far things travel as they arrive, and the scales they grow from or press to. */
const RISE = 8;
const REVEAL_RISE = 16;
const ENTER_SCALE = 0.97;
const PRESS_SCALE = 0.97;
const LIFT = 2;

/** A fitted spring may miss its token's visual duration by 3%, and the frames may stray 3ms from its curve. */
const SPRING_SLACK = 0.03;
const CURVE_ERROR = 3;
/** A fitted tween may miss its token's duration by 4ms: WebKit's clock counts whole milliseconds. */
const TWEEN_SLACK = 4;
/** The latest an animation may start after the press: React's commit and Motion's first frame, with room for a busy machine. */
const START_MAX = 100;
/** One and two frames at 60Hz. */
const FRAME = 17;
const TWO_FRAMES = 34;

const testId = (id: string): string => `[data-testid="${id}"]`;
const INDICATOR = '[aria-label="Edge"] [data-bt-part="indicator"]';
const STAGGER_ITEMS = `${testId("stagger")} > [data-bt-part="item"]`;
const PIECES = '[data-bt="Confetti"] [data-bt-part="piece"]';
const ms = (value: number): string => `${value.toFixed(0)}ms`;

const opacity = (reading: Reading): number => reading.opacity;

/** How each preset arrives besides fading in: the value that moves, where it starts and its spring. */
const ARRIVALS = {
  fade: null,
  rise: { pick: "y", from: RISE, to: 0, spring: "smooth" },
  pop: { pick: "scale", from: ENTER_SCALE, to: 1, spring: "smooth" },
  toast: { pick: "y", from: RISE, to: 0, spring: "snappy" },
  menu: { pick: "scale", from: ENTER_SCALE, to: 1, spring: "snappy" },
} as const;

const PRESETS = Object.keys(ARRIVALS) as readonly (keyof typeof ARRIVALS)[];

function report(description: string): void {
  test.info().annotations.push({ type: "motion", description });
}

async function open(
  page: Page,
  motion: "full" | "reduced" | "system",
  startOnLoad?: string,
): Promise<void> {
  await installSampler(page, startOnLoad);
  const setting = motion === "system" ? "" : `&motion=${motion}`;
  await page.goto(`/?chrome=0${setting}#/motion`);
  await page.getByRole("heading", { name: "Motion", level: 1 }).waitFor();
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

async function centerOf(
  locator: Locator,
): Promise<{ readonly x: number; readonly y: number }> {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (!box) throw new Error("It isn't on the page.");
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/** Scrolls so `share` of the element's height shows at the bottom of the viewport. */
async function scrollToShow(
  page: Page,
  selector: string,
  share: number,
): Promise<void> {
  await page.evaluate(
    (options) => {
      const element = document.querySelector(options.selector);
      if (!element) throw new Error(`Nothing matches ${options.selector}`);
      const { top, height } = element.getBoundingClientRect();
      window.scrollBy(0, top + height * options.share - window.innerHeight);
    },
    { selector, share },
  );
}

/**
 * Resolves once the page has told every intersection observer watching `selector` where it is now: a new
 * observer hears last, so when it hears, the element's own observers already have.
 */
async function intersectionsDelivered(
  page: Page,
  selector: string,
): Promise<void> {
  await page.evaluate(
    (target) =>
      new Promise<void>((resolve) => {
        const element = document.querySelector(target);
        if (!element) throw new Error(`Nothing matches ${target}`);
        const observer = new IntersectionObserver(() => {
          observer.disconnect();
          resolve();
        });
        observer.observe(element);
      }),
    selector,
  );
}

/** `pick` of the first element, as progress from where it was before the action to where it ended. */
function travelled(
  run: Run,
  pick: (reading: Reading) => number,
): readonly Point[] {
  const points = trace(run, pick);
  const before = run.before.elements[0];
  const last = points.at(-1);
  if (!before || !last) throw new Error("It wasn't there before and after.");
  return progress(points, pick(before), last.value);
}

/** The progress follows spring `name`'s curve. */
function expectSpringCurve(
  label: string,
  points: readonly Point[],
  name: SpringName,
): Fit {
  const spring = SPRINGS[name];
  const fit = fitSpring(points, spring);
  report(
    `${label}: a ${fit.visualDuration.toFixed(3)}s spring (spring.${name} is ${String(spring.visualDuration)}s), within ${fit.error.toFixed(1)}ms over ${String(fit.frames)} frames`,
  );
  expect(
    Math.abs(fit.visualDuration / spring.visualDuration - 1),
  ).toBeLessThanOrEqual(SPRING_SLACK);
  expect(fit.error).toBeLessThanOrEqual(CURVE_ERROR);
  if (spring.bounce === 0) expect(overshoot(points)).toBeLessThan(0.01);
  return fit;
}

/**
 * The progress follows spring `name`, starts within `START_MAX` of the press, and the sampled 95% comes no
 * more than a frame after the spring's own.
 */
function expectSpring(
  label: string,
  points: readonly Point[],
  name: SpringName,
): Fit {
  const fit = expectSpringCurve(label, points, name);
  const settle = settleTime(points);
  const due = fit.start + springSettle(SPRINGS[name]);
  report(
    `${label}: 95% at ${ms(settle)} after the press (the spring alone takes ${ms(due - fit.start)})`,
  );
  expect(fit.start).toBeLessThanOrEqual(START_MAX);
  expect(settle).toBeGreaterThanOrEqual(due - 2);
  expect(
    points.filter(({ t }) => t >= due && t < settle).length,
  ).toBeLessThanOrEqual(1);
  return fit;
}

/** The progress follows a `duration` ms tween on `curve`. */
function expectTween(
  label: string,
  points: readonly Point[],
  curve: Curve,
  duration: number,
): Fit {
  const fit = fitTween(points, curve);
  report(
    `${label}: ${fit.duration.toFixed(1)}ms (${String(duration)}ms wanted), within ${fit.error.toFixed(1)}ms over ${String(fit.frames)} frames`,
  );
  expect(Math.abs(fit.duration - duration)).toBeLessThanOrEqual(TWEEN_SLACK);
  expect(fit.error).toBeLessThanOrEqual(CURVE_ERROR);
  return fit;
}

/** Lands in one step: no frame in between, and at rest by the second frame after the press. */
function expectInstant(points: readonly Point[]): void {
  expect(framesBetween(points)).toBe(0);
  const second = points[1];
  if (!second) throw new Error("Fewer than two frames were sampled.");
  expect(settleTime(points)).toBeLessThanOrEqual(second.t);
}

/** `AnimatePresence` unmounts content a frame or two after its exit: gone by the third frame after `faded`. */
function expectGoneSoonAfter(run: Run, faded: number, id?: number): void {
  const third = run.frames.filter(({ t }) => t >= faded)[2];
  if (!third) throw new Error("The run ended too soon.");
  expect(goneAt(run, id)).toBeLessThanOrEqual(third.t);
}

/** No sampled element moved off its resting place. */
function expectAtRest(run: Run): void {
  for (const { elements } of run.frames) {
    for (const reading of elements) {
      expect(reading.y).toBe(0);
      expect(reading.scale).toBe(1);
    }
  }
}

function transitionsOf(
  run: Run,
  property: string,
): readonly (readonly [number, string])[] {
  return run.transitions
    .filter((transition) => transition.property === property)
    .map(({ duration, easing }) => [duration, easing] as const);
}

test.describe("full motion", () => {
  test.beforeEach(async ({ page }) => {
    await open(page, "full");
  });

  test("spring.instant lands on the next frame", async ({ page }) => {
    const run = await sampleClick(
      page,
      testId("spring-instant-move"),
      testId("spring-instant"),
      300,
    );
    expectInstant(travelled(run, (reading) => reading.left));
  });

  for (const name of SPRING_NAMES) {
    test(`spring.${name} follows its curve`, async ({ page }) => {
      const run = await sampleClick(
        page,
        testId(`spring-${name}-move`),
        testId(`spring-${name}`),
        900,
      );
      expectSpring(
        `spring.${name}`,
        travelled(run, (reading) => reading.left),
        name,
      );
    });
  }

  test("Morph's height follows its content with spring.smooth", async ({
    page,
  }) => {
    const run = await sampleClick(
      page,
      testId("morph-toggle"),
      testId("morph"),
      600,
    );
    expectSpring(
      "Morph height",
      travelled(run, (reading) => reading.height),
      "smooth",
    );
  });

  test("Morph crossfades its content over dur-fast", async ({ page }) => {
    const run = await sampleClick(
      page,
      testId("morph-toggle"),
      `${testId("morph")} [data-bt-part="view"]`,
      400,
    );
    const old = run.before.elements[0]?.id;
    const next = elementIds(run).find((id) => id !== old);
    if (old === undefined || next === undefined) {
      throw new Error("The content never swapped.");
    }
    const leaving = expectTween(
      "Morph old content",
      progress(traceOf(run, old, opacity), 1, 0),
      EASE_STANDARD,
      DURATIONS.fast,
    );
    expectTween(
      "Morph new content",
      progress(traceOf(run, next, opacity), 0, 1),
      EASE_STANDARD,
      DURATIONS.fast,
    );
    expectGoneSoonAfter(run, leaving.start + DURATIONS.fast, old);
  });

  test("the shared indicator slides with spring.snappy", async ({ page }) => {
    const run = await sampleClick(page, testId("edge-Glow"), INDICATOR, 500);
    expectSpring(
      "SharedIndicator",
      travelled(run, (reading) => reading.left),
      "snappy",
    );
  });

  for (const preset of PRESETS) {
    test(`the ${preset} preset arrives on its curves and leaves faster`, async ({
      page,
    }) => {
      const toggle = testId(`presence-${preset}-toggle`);
      const target = testId(`presence-${preset}`);
      const enter = await sampleClick(page, toggle, target, 700);
      const exit = await sampleClick(page, toggle, target, 400);
      const fading = expectTween(
        `${preset} fading in`,
        progress(trace(enter, opacity), 0, 1),
        EASE_OUT,
        DURATIONS.base,
      );
      const arrival = ARRIVALS[preset];
      if (arrival) {
        const points = progress(
          trace(enter, (reading) => reading[arrival.pick]),
          arrival.from,
          arrival.to,
        );
        const moving = expectSpring(
          `${preset} arriving`,
          points,
          arrival.spring,
        );
        expect(Math.abs(moving.start - fading.start)).toBeLessThanOrEqual(3);
      }
      const leaving = expectTween(
        `${preset} fading out`,
        progress(trace(exit, opacity), 1, 0),
        EASE_IN,
        DURATIONS.fast,
      );
      expectGoneSoonAfter(exit, leaving.start + DURATIONS.fast);
      expect(goneAt(exit)).toBeLessThan(settledAt(enter));
      expectAtRest(exit);
    });
  }

  test("a menu grows in from its trigger on spring.snappy and leaves with a dur-fast fade", async ({
    page,
  }) => {
    const menu = '[data-bt="Menu"]';
    await page.goto("/?chrome=0&motion=full#/menu");
    const trigger = page
      .getByRole("button", { name: "Card actions", exact: true })
      .first();
    await trigger.focus();
    await startSampling(page, menu);
    await page.keyboard.press("Enter");
    const enter = await finishSampling(page, 700);
    const fading = expectTween(
      "menu fading in",
      progress(trace(enter, opacity), 0, 1),
      EASE_OUT,
      DURATIONS.base,
    );
    const growing = expectSpring(
      "menu growing",
      progress(
        trace(enter, (reading) => reading.scale),
        ENTER_SCALE,
        1,
      ),
      "snappy",
    );
    expect(Math.abs(growing.start - fading.start)).toBeLessThanOrEqual(3);
    await startSampling(page, menu);
    await page.keyboard.press("Escape");
    const exit = await finishSampling(page, 400);
    await expect(trigger).toBeFocused();
    const leaving = expectTween(
      "menu fading out",
      progress(trace(exit, opacity), 1, 0),
      EASE_IN,
      DURATIONS.fast,
    );
    expectGoneSoonAfter(exit, leaving.start + DURATIONS.fast);
    expectAtRest(exit);
  });

  test("pressing scales to 97% over dur-press and lets go over dur-fast", async ({
    page,
  }) => {
    const target = testId("spring-instant-move");
    const { x, y } = await centerOf(page.locator(target));
    await page.mouse.move(x, y);
    await startSampling(page, target, ["pointerup"]);
    await page.mouse.down();
    await page.waitForTimeout(200);
    await page.mouse.up();
    const run = await finishSampling(page, 300);
    const up = run.marks["pointerup"];
    if (up === undefined) throw new Error("The pointer never came up.");
    const scale = trace(run, (reading) => reading.scale);
    const held = scale.filter(({ t }) => t < up);
    const released = scale.filter(({ t }) => t >= up);
    expect(transitionsOf(run, "scale")).toEqual([
      [DURATIONS.press, CSS_EASE_OUT],
      [DURATIONS.fast, CSS_EASE_OUT],
    ]);
    expect(held.at(-1)?.value).toBeCloseTo(PRESS_SCALE, 4);
    expectTween(
      "press letting go",
      progress(released, PRESS_SCALE, 1),
      EASE_OUT,
      DURATIONS.fast,
    );
    expect(released.at(-1)?.value).toBe(1);
  });

  test("hovering a card lifts it 2px over dur-fast", async ({ page }) => {
    const target = testId("lift-card");
    const { x, y } = await centerOf(page.locator(target));
    await startSampling(page, target);
    await page.mouse.move(x, y);
    const run = await finishSampling(page, 300);
    expect(transitionsOf(run, "translate")).toEqual([
      [DURATIONS.fast, CSS_EASE_OUT],
    ]);
    expect(transitionsOf(run, "box-shadow")).toEqual([
      [DURATIONS.fast, CSS_EASE_OUT],
    ]);
    const lift = progress(
      trace(run, (reading) => reading.y),
      0,
      -LIFT,
    );
    expectTween("hover lift", lift, EASE_OUT, DURATIONS.fast);
    expect(lift.at(-1)?.value).toBe(1);
  });

  test("Stagger brings its items in 50ms apart once it scrolls into view", async ({
    page,
  }) => {
    const waiting = await page
      .locator(STAGGER_ITEMS)
      .evaluateAll((items) =>
        items.map((item) => getComputedStyle(item).opacity),
      );
    expect(waiting).toEqual(["0", "0", "0"]);
    await startSampling(page, STAGGER_ITEMS);
    await page.locator(testId("stagger")).evaluate((element) => {
      element.scrollIntoView({ block: "center" });
    });
    const run = await finishSampling(page, 1100);
    const items = elementIds(run).map((id) => {
      const offsets = traceOf(run, id, (reading) => reading.y);
      const rise = progress(offsets, REVEAL_RISE, 0);
      const rising = expectSpringCurve(
        `Stagger item ${String(id)}`,
        rise,
        "gentle",
      );
      const fading = expectTween(
        `Stagger item ${String(id)} fading in`,
        progress(traceOf(run, id, opacity), 0, 1),
        EASE_OUT,
        DURATIONS.base,
      );
      expect(
        Math.max(...offsets.map(({ value }) => value)),
      ).toBeLessThanOrEqual(REVEAL_RISE + 1e-3);
      expect(Math.abs(rising.start - fading.start)).toBeLessThanOrEqual(3);
      return { start: rising.start, settle: settleTime(rise) };
    });
    expect(items).toHaveLength(3);
    for (const [index, item] of items.entries()) {
      const previous = items[index - 1];
      if (!previous) continue;
      report(`Stagger gap: ${(item.start - previous.start).toFixed(1)}ms`);
      expect(
        Math.abs(item.start - previous.start - STAGGER),
      ).toBeLessThanOrEqual(4);
    }
    const first = items[0];
    const last = items.at(-1);
    if (!first || !last) throw new Error("No items came in.");
    expect(last.settle - first.start).toBeLessThanOrEqual(ENTRANCE_MAX);
  });

  test("Reveal waits for 15% to show, then rises in with spring.gentle", async ({
    page,
  }) => {
    const target = testId("reveal");
    await scrollToShow(page, target, 0.08);
    await startSampling(page, target);
    const early = await finishSampling(page, 250);
    expect(trace(early, opacity).every(({ value }) => value === 0)).toBe(true);

    await startSampling(page, target);
    await scrollToShow(page, target, 0.3);
    await markSample(page, "scrolled");
    const run = await finishSampling(page, 900);
    const scrolled = run.marks["scrolled"];
    if (scrolled === undefined) throw new Error("It never scrolled.");
    const rising = expectSpringCurve(
      "Reveal",
      progress(
        trace(run, (reading) => reading.y),
        REVEAL_RISE,
        0,
      ),
      "gentle",
    );
    expectTween(
      "Reveal fading in",
      progress(trace(run, opacity), 0, 1),
      EASE_OUT,
      DURATIONS.base,
    );
    expect(rising.start - scrolled).toBeLessThanOrEqual(START_MAX);
  });

  test("confetti flies up from the button and clears in 900ms", async ({
    page,
  }) => {
    const origin = await centerOf(page.getByTestId("celebrate"));
    const run = await sampleClick(page, testId("celebrate"), PIECES, 1100);
    const pieces = elementIds(run);
    expect(pieces.length).toBeGreaterThanOrEqual(28);
    expect(pieces.length).toBeLessThanOrEqual(40);

    const angles = pieces.map((id) => {
      const path = readingsOf(run, id);
      const first = path[0];
      const last = path.at(-1);
      const away = path.find(
        ({ reading }) => Math.hypot(reading.x, reading.y) > 4,
      );
      const late = path.findLast(({ t }) => last && t <= last.t - 150);
      if (!first || !last || !away || !late) {
        throw new Error(`Piece ${String(id)} didn't fly.`);
      }
      const { reading } = first;
      expect(reading.left + reading.width / 2 - reading.x).toBeCloseTo(
        origin.x,
        0,
      );
      expect(reading.top + reading.height / 2 - reading.y).toBeCloseTo(
        origin.y,
        0,
      );
      expect(
        path
          .filter(({ t }) => t <= CELEBRATION * 0.6)
          .every(({ reading: { opacity: value } }) => value === 1),
      ).toBe(true);
      const fadeLeft = (CELEBRATION - (last.t - first.t)) / (CELEBRATION * 0.3);
      expect(last.reading.opacity).toBeLessThanOrEqual(
        Math.max(0, fadeLeft) + 0.15,
      );
      expect(last.reading.y).toBeGreaterThan(late.reading.y);
      return (Math.atan2(away.reading.x, -away.reading.y) * 180) / Math.PI;
    });
    report(
      `confetti: ${String(pieces.length)} pieces, thrown ${Math.min(...angles).toFixed(0)}° to ${Math.max(...angles).toFixed(0)}° from straight up`,
    );
    expect(Math.max(...angles.map(Math.abs))).toBeLessThanOrEqual(70);
    expect(Math.max(...angles) - Math.min(...angles)).toBeGreaterThanOrEqual(
      60,
    );
    const during = run.frames.filter(
      ({ t }) => t >= TWO_FRAMES && t <= CELEBRATION - 50,
    );
    const after = run.frames.filter(({ t }) => t >= CELEBRATION + 100);
    expect(during.every(({ elements }) => elements.length > 0)).toBe(true);
    expect(
      after.every(({ elements }) =>
        elements.every((reading) => reading.opacity <= 0.05),
      ),
    ).toBe(true);
    await expect(page.locator(PIECES)).toHaveCount(0);
  });
});

test.describe("full motion from the first frame", () => {
  test("content in view as the page loads gets one 200ms fade, without rising", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 2400 });
    await open(page, "full", testId("reveal"));
    const run = await finishSampling(page, 600);
    expectTween(
      "Reveal in view on load",
      progress(trace(run, opacity), 0, 1),
      EASE_OUT,
      DURATIONS.base,
    );
    expectAtRest(run);
  });

  test("Loop steps every 4s, and holds while hovered or off screen", async ({
    page,
  }) => {
    await page.clock.install();
    await open(page, "full");
    await page.clock.pauseAt(Date.now() + 1000);
    const target = testId("loop");
    const loop = page.locator(target);
    const step = async (): Promise<string | null> =>
      loop.getAttribute("data-step");
    const nextStepAfterACycle = async (from: string): Promise<string> => {
      await page.clock.runFor(LOOP_CYCLE - 10);
      expect(await step()).toBe(from);
      await page.clock.runFor(20);
      const next = String((Number(from) + 1) % 3);
      await expect(loop).toHaveAttribute("data-step", next);
      return next;
    };

    await loop.evaluate((element) => {
      element.scrollIntoView({ block: "center" });
    });
    await intersectionsDelivered(page, target);
    const first = await nextStepAfterACycle("0");

    const { x, y } = await centerOf(loop);
    await page.mouse.move(x, y);
    await page.clock.runFor(LOOP_CYCLE * 2);
    expect(await step()).toBe(first);
    await page.mouse.move(0, 0);
    const second = await nextStepAfterACycle(first);

    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await intersectionsDelivered(page, target);
    await page.clock.runFor(LOOP_CYCLE * 2);
    expect(await step()).toBe(second);
  });
});

test.describe("reduced motion", () => {
  test.beforeEach(async ({ page }) => {
    await open(page, "reduced");
  });

  for (const name of ["instant", ...SPRING_NAMES]) {
    test(`spring.${name} lands at once`, async ({ page }) => {
      const run = await sampleClick(
        page,
        testId(`spring-${name}-move`),
        testId(`spring-${name}`),
        300,
      );
      expectInstant(travelled(run, (reading) => reading.left));
    });
  }

  test("Morph and the indicator land at once", async ({ page }) => {
    const morph = await sampleClick(
      page,
      testId("morph-toggle"),
      testId("morph"),
      300,
    );
    expectInstant(travelled(morph, (reading) => reading.height));
    const indicator = await sampleClick(
      page,
      testId("edge-Glow"),
      INDICATOR,
      300,
    );
    expectInstant(travelled(indicator, (reading) => reading.left));
  });

  test("presets only fade, in 100ms", async ({ page }) => {
    for (const preset of PRESETS) {
      const toggle = testId(`presence-${preset}-toggle`);
      const target = testId(`presence-${preset}`);
      const enter = await sampleClick(page, toggle, target, 300);
      const exit = await sampleClick(page, toggle, target, 300);
      expectTween(
        `${preset} fading in`,
        progress(trace(enter, opacity), 0, 1),
        LINEAR,
        DURATIONS.reduced,
      );
      expectTween(
        `${preset} fading out`,
        progress(trace(exit, opacity), 1, 0),
        LINEAR,
        DURATIONS.reduced,
      );
      expectAtRest(enter);
      expectAtRest(exit);
    }
  });

  test("Morph crossfades its content in 100ms", async ({ page }) => {
    const run = await sampleClick(
      page,
      testId("morph-toggle"),
      `${testId("morph")} [data-bt-part="view"]`,
      300,
    );
    const old = run.before.elements[0]?.id;
    const next = elementIds(run).find((id) => id !== old);
    if (old === undefined || next === undefined) {
      throw new Error("The content never swapped.");
    }
    expectTween(
      "Morph old content",
      progress(traceOf(run, old, opacity), 1, 0),
      LINEAR,
      DURATIONS.reduced,
    );
    expectTween(
      "Morph new content",
      progress(traceOf(run, next, opacity), 0, 1),
      LINEAR,
      DURATIONS.reduced,
    );
  });

  test("Stagger and Reveal simply show", async ({ page }) => {
    const selector = `${STAGGER_ITEMS}, ${testId("reveal")}`;
    await startSampling(page, selector);
    await page.locator(testId("reveal")).evaluate((element) => {
      element.scrollIntoView({ block: "center" });
    });
    const run = await finishSampling(page, 400);
    expect(elementIds(run)).toHaveLength(4);
    expect(
      [run.before, ...run.frames].every(({ elements }) =>
        elements.every((reading) => reading.opacity === 1),
      ),
    ).toBe(true);
    expectAtRest(run);
  });

  test("pressing scales to 97% at once and hovering doesn't lift", async ({
    page,
  }) => {
    const button = testId("spring-instant-move");
    const pressAt = await centerOf(page.locator(button));
    await page.mouse.move(pressAt.x, pressAt.y);
    await startSampling(page, button);
    await page.mouse.down();
    const pressed = await finishSampling(page, 200);
    await page.mouse.up();
    const scale = progress(
      trace(pressed, (reading) => reading.scale),
      1,
      PRESS_SCALE,
    );
    expect(transitionsOf(pressed, "scale")).toEqual([]);
    expect(framesBetween(scale)).toBe(0);
    expect(scale.at(-1)?.value).toBeCloseTo(1, 4);

    const card = testId("lift-card");
    const hoverAt = await centerOf(page.locator(card));
    await startSampling(page, card);
    await page.mouse.move(hoverAt.x, hoverAt.y);
    const hovered = await finishSampling(page, 300);
    expectAtRest(hovered);
  });

  test("Loop stays on its first step", async ({ page }) => {
    await page.clock.install();
    await page.reload();
    await page.getByRole("heading", { name: "Motion", level: 1 }).waitFor();
    await page.clock.pauseAt(Date.now() + 1000);
    const loop = page.getByTestId("loop");
    await loop.evaluate((element) => {
      element.scrollIntoView({ block: "center" });
    });
    await intersectionsDelivered(page, testId("loop"));
    await page.clock.runFor(LOOP_CYCLE * 2 + 100);
    await expect(loop).toHaveAttribute("data-step", "0");
  });

  test("confetti stays off", async ({ page }) => {
    await page.getByTestId("celebrate").click();
    await expect(page.locator(PIECES)).toHaveCount(0);
  });
});

test.describe("motion turning reduced mid-animation", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await open(page, "system");
    await expect(page.locator("html")).toHaveAttribute(
      "data-bt-motion",
      "full",
    );
  });

  /**
   * Samples `selector` while `act` starts an animation, and turns the system setting to reduced motion once
   * the first match has moved `moved.by` in `moved.channel`. Returns the run and when the page heard about
   * the switch.
   */
  async function switchMidway(
    page: Page,
    selector: string,
    act: () => Promise<void>,
    moved: {
      readonly channel: Channel;
      readonly from?: number;
      readonly by: number;
    },
  ): Promise<{ readonly run: Run; readonly switched: number }> {
    const from = moved.from ?? (await peek(page, selector))?.[moved.channel];
    if (from === undefined) throw new Error(`Nothing matches ${selector}.`);
    await startSampling(page, selector);
    await page.evaluate(() => {
      matchMedia("(prefers-reduced-motion: reduce)").addEventListener(
        "change",
        () => {
          window.motionSampler?.mark("switched");
        },
        { once: true },
      );
    });
    await act();
    await waitUntilMoved(page, selector, moved.channel, from, moved.by);
    await page.emulateMedia({ reducedMotion: "reduce" });
    const run = await finishSampling(page, 400);
    const switched = run.marks["switched"];
    if (switched === undefined) throw new Error("Motion never turned reduced.");
    return { run, switched };
  }

  const clickInPage =
    (page: Page, selector: string) => async (): Promise<void> => {
      await page.locator(selector).evaluate((element) => {
        if (element instanceof HTMLElement) element.click();
      });
    };

  /**
   * Well short of the end a frame before motion turned reduced, and exactly at rest from the second frame
   * after. Frames are stamped when they begin, so the one that heard the switch may begin before it.
   */
  function expectLandedAtOnce(
    points: readonly Point[],
    switched: number,
  ): void {
    expect(
      points.findLast(({ t }) => t <= switched - FRAME)?.value,
    ).toBeLessThan(0.9);
    const after = points.filter(({ t }) => t >= switched);
    expect(after.length).toBeGreaterThan(2);
    expect(after.slice(1).every(({ value }) => value === 1)).toBe(true);
  }

  test("a rising Presence lands in place and finishes its fade in 100ms", async ({
    page,
  }) => {
    const { run, switched } = await switchMidway(
      page,
      testId("presence-rise"),
      clickInPage(page, testId("presence-rise-toggle")),
      { channel: "y", from: RISE, by: 1 },
    );
    expectLandedAtOnce(
      progress(
        trace(run, (reading) => reading.y),
        RISE,
        0,
      ),
      switched,
    );
    expect(
      trace(run, opacity)
        .filter(({ t }) => t >= switched + DURATIONS.reduced + TWO_FRAMES)
        .every(({ value }) => value === 1),
    ).toBe(true);
  });

  test("the shared indicator and Morph's height land at once", async ({
    page,
  }) => {
    const slide = await switchMidway(
      page,
      INDICATOR,
      clickInPage(page, testId("edge-Glow")),
      { channel: "left", by: 10 },
    );
    expectLandedAtOnce(
      travelled(slide.run, (reading) => reading.left),
      slide.switched,
    );
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expect(page.locator("html")).toHaveAttribute(
      "data-bt-motion",
      "full",
    );
    const grow = await switchMidway(
      page,
      testId("morph"),
      clickInPage(page, testId("morph-toggle")),
      { channel: "height", by: 4 },
    );
    expectLandedAtOnce(
      travelled(grow.run, (reading) => reading.height),
      grow.switched,
    );
  });

  test("a Stagger mid-entrance shows all its items at once", async ({
    page,
  }) => {
    const { run, switched } = await switchMidway(
      page,
      STAGGER_ITEMS,
      async () => {
        await page.locator(testId("stagger")).evaluate((element) => {
          element.scrollIntoView({ block: "center" });
        });
      },
      { channel: "opacity", by: 0.1 },
    );
    expect(
      run.frames
        .filter(({ t }) => t <= switched - FRAME)
        .some(({ elements }) =>
          elements.some(
            (reading) => reading.opacity > 0 && reading.opacity < 1,
          ),
        ),
    ).toBe(true);
    const after = run.frames.filter(({ t }) => t >= switched);
    expect(after.length).toBeGreaterThan(2);
    for (const { elements } of after.slice(1)) {
      for (const reading of elements) {
        expect(reading.opacity).toBe(1);
        expect(reading.y).toBe(0);
      }
    }
  });
});

test.describe("Card Studio (MOTION_SPEC §3)", () => {
  const CARD = '[data-testid="title-card"]';
  const CANVAS = '[data-bt="Stage"] > [data-bt-part="canvas"]';
  const BACKGROUND = `${CANVAS} > [data-bt-part="background"]`;
  const CROP = `${CANVAS} > [data-bt-part="crop"]`;
  const FINISH_INDICATOR = '[aria-label="Finish"] [data-bt-part="indicator"]';
  const LEAN_KNOB = '[aria-label="Lean"] [data-bt-part="knob"]';

  test.beforeEach(async ({ page }) => {
    await installSampler(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/?chrome=0&motion=full#/card-studio");
    await page.getByTestId("title-card").waitFor();
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    await page.waitForTimeout(300);
  });

  /** Clicks inside the page right after sampling starts, so the first frame is the one the click lands in. */
  async function sampleClickOn(
    page: Page,
    target: Locator,
    selector: string,
    duration: number,
  ): Promise<Run> {
    await startSampling(page, selector);
    await target.evaluate((element) => {
      if (element instanceof HTMLElement) element.click();
    });
    return finishSampling(page, duration);
  }

  /**
   * Drags `handle` in steps while reading, as each frame begins, where `control` is and how big the card
   * is drawn. A card set in the same commit as the control is drawn by Motion during the frame, after this
   * read, so it shows one read later: `delay` is the most reads the card took to follow a control move, and
   * `trailing` counts card changes more than a read after the control's last move.
   */
  async function followDrag(
    page: Page,
    handle: Locator,
    control: string,
    offset: { readonly x: number; readonly y: number },
  ): Promise<{
    readonly moved: number;
    readonly delay: number;
    readonly trailing: number;
  }> {
    const { x, y } = await centerOf(handle);
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.evaluate(
      ({ controlSelector, cardSelector }) => {
        const controlElement = document.querySelector(controlSelector);
        const cardElement = document.querySelector(cardSelector);
        if (!controlElement || !cardElement)
          throw new Error("No control or card.");
        const probe = window as unknown as {
          followed: { control: number; card: number }[];
          stopped: boolean;
        };
        probe.followed = [];
        probe.stopped = false;
        const read = (): void => {
          if (probe.stopped) return;
          const at = controlElement.getBoundingClientRect();
          const drawn = cardElement.getBoundingClientRect();
          probe.followed.push({
            control: Math.round((at.left + at.top * 1000) * 10),
            card: Math.round((drawn.width + drawn.height * 1000) * 10),
          });
          requestAnimationFrame(read);
        };
        requestAnimationFrame(read);
      },
      { controlSelector: control, cardSelector: CARD },
    );
    for (let step = 1; step <= 8; step += 1) {
      await page.mouse.move(
        x + (offset.x * step) / 8,
        y + (offset.y * step) / 8,
      );
      await page.waitForTimeout(TWO_FRAMES);
    }
    await page.mouse.up();
    await page.waitForTimeout(300);
    const followed = await page.evaluate(() => {
      const probe = window as unknown as {
        followed: { control: number; card: number }[];
        stopped: boolean;
      };
      probe.stopped = true;
      return probe.followed;
    });
    const changed = (pick: "control" | "card"): number[] =>
      followed.flatMap((frame, index) => {
        const previous = followed[index - 1];
        return previous && frame[pick] !== previous[pick] ? [index] : [];
      });
    const moves = changed("control");
    const cardChanges = changed("card");
    const delay = Math.max(
      0,
      ...moves.map((move) => {
        const next = cardChanges.find((index) => index >= move);
        return next === undefined ? Number.POSITIVE_INFINITY : next - move;
      }),
    );
    const lastMove = moves.at(-1) ?? 0;
    const trailing = cardChanges.filter((index) => index > lastMove + 1).length;
    return { moved: moves.length, delay, trailing };
  }

  for (const { name, control } of [
    { name: "Scale", control: "scale" },
    { name: "Turn", control: "turn" },
  ] as const) {
    test(`a ${control} drag changes the card in the same frame as the thumb, with nothing left to catch up`, async ({
      page,
    }) => {
      const thumb = page.getByRole("slider", { name, exact: true });
      await thumb.evaluate((element) => {
        element.setAttribute("data-dragged", "");
      });
      const { moved, delay, trailing } = await followDrag(
        page,
        thumb,
        "[data-dragged]",
        { x: -60, y: 0 },
      );
      report(
        `${name} drag: the thumb moved on ${String(moved)} frames; the card followed within ${String(delay)} read and changed ${String(trailing)} times after`,
      );
      expect(moved).toBeGreaterThanOrEqual(4);
      expect(delay).toBeLessThanOrEqual(1);
      expect(trailing).toBe(0);
    });
  }

  test("a lean drag turns the card in the same frame as the knob, with nothing left to catch up", async ({
    page,
  }) => {
    const { moved, delay, trailing } = await followDrag(
      page,
      page.getByRole("group", { name: "Lean" }),
      LEAN_KNOB,
      { x: 24, y: -12 },
    );
    report(
      `Lean drag: the knob moved on ${String(moved)} frames; the card followed within ${String(delay)} read and changed ${String(trailing)} times after`,
    );
    expect(moved).toBeGreaterThanOrEqual(4);
    expect(delay).toBeLessThanOrEqual(1);
    expect(trailing).toBe(0);
  });

  test("the Flat chip lays a leaning card flat on spring.smooth", async ({
    page,
  }) => {
    await page.getByRole("slider", { name: "Left and right" }).focus();
    await page.keyboard.press("Shift+ArrowRight");
    await page.waitForTimeout(800);
    const turns = await page.evaluate(async (selector) => {
      const card = document.querySelector<HTMLElement>(selector);
      const chip = [...document.querySelectorAll<HTMLElement>("button")].find(
        (button) => button.textContent.trim() === "Flat",
      );
      if (!card || !chip) throw new Error("No card or Flat chip.");
      const angle = (): number =>
        Number(/rotateY\((-?[\d.]+)deg\)/.exec(card.style.transform)?.[1] ?? 0);
      const start = angle();
      const pressed = performance.now();
      chip.click();
      const read: { t: number; value: number }[] = [];
      while (performance.now() - pressed < 700) {
        const t = await new Promise<number>((resolve) => {
          requestAnimationFrame(resolve);
        });
        read.push({ t: t - pressed, value: angle() });
      }
      return { start, read };
    }, CARD);
    expect(turns.start).toBeCloseTo(10, 1);
    expectSpring(
      "lean back to flat",
      progress(turns.read, turns.start, 0),
      "smooth",
    );
  });

  test("a swatch swaps the background in one frame", async ({ page }) => {
    const frames = await page.evaluate(async (selector) => {
      const background = document.querySelector(selector);
      const swatch = [
        ...document.querySelectorAll<HTMLElement>('[role="radio"]'),
      ].find((element) => element.getAttribute("aria-label") === "Peach");
      if (!background || !swatch) throw new Error("No background or swatch.");
      const before = getComputedStyle(background).backgroundImage;
      swatch.click();
      const seen: boolean[] = [];
      for (let frame = 0; frame < 6; frame += 1) {
        await new Promise((resolve) => requestAnimationFrame(resolve));
        seen.push(getComputedStyle(background).backgroundImage !== before);
      }
      return seen;
    }, BACKGROUND);
    expect(frames.indexOf(true)).toBeGreaterThanOrEqual(0);
    expect(frames.indexOf(true)).toBeLessThanOrEqual(1);
  });

  test("the finish control's indicator slides on spring.snappy", async ({
    page,
  }) => {
    const run = await sampleClickOn(
      page,
      page
        .getByRole("radiogroup", { name: "Finish" })
        .getByRole("radio", { name: "Paper" }),
      FINISH_INDICATOR,
      500,
    );
    expectSpring(
      "finish indicator",
      travelled(run, (reading) => reading.left),
      "snappy",
    );
  });

  test("the finish crossfades the card's fill, ink and shadow over dur-base", async ({
    page,
  }) => {
    const run = await sampleClickOn(
      page,
      page.getByRole("radio", { name: "Clear" }),
      CARD,
      400,
    );
    for (const property of ["background-color", "color", "box-shadow"]) {
      expect(transitionsOf(run, property)).toEqual([
        [DURATIONS.base, CSS_EASE_STANDARD],
      ]);
    }
  });

  test("a depth drag sets the shadow on every frame, with no transition", async ({
    page,
  }) => {
    const thumb = page.getByRole("slider", { name: "Depth" });
    const shadow = (): Promise<string> =>
      page
        .getByTestId("title-card")
        .evaluate((element) => getComputedStyle(element).boxShadow);
    const before = await shadow();
    const { x, y } = await centerOf(thumb);
    await page.mouse.move(x, y);
    await page.mouse.down();
    await startSampling(page, CARD);
    for (let step = 1; step <= 6; step += 1) {
      await page.mouse.move(x + 8 * step, y);
      await page.waitForTimeout(FRAME);
    }
    const run = await finishSampling(page, 100);
    await page.mouse.up();
    expect(transitionsOf(run, "box-shadow")).toEqual([]);
    expect(await shadow()).not.toBe(before);
  });

  test("switching to a color crossfades the fill's rows over dur-fast while the height follows on spring.smooth", async ({
    page,
  }) => {
    const morph = '[aria-label="Card settings"] [data-bt="Morph"]';
    const height = await sampleClickOn(
      page,
      page.getByRole("radio", { name: "Color" }),
      morph,
      700,
    );
    expectSpring(
      "swatch height",
      travelled(height, (reading) => reading.height),
      "smooth",
    );
    await page.getByRole("radio", { name: "Blend" }).click();
    await page.waitForTimeout(800);
    const views = await sampleClickOn(
      page,
      page.getByRole("radio", { name: "Color" }),
      `${morph} [data-bt-part="view"]`,
      400,
    );
    const old = views.before.elements[0]?.id;
    const next = elementIds(views).find((id) => id !== old);
    if (old === undefined || next === undefined)
      throw new Error("The rows never swapped.");
    expectTween(
      "old rows",
      progress(traceOf(views, old, opacity), 1, 0),
      EASE_STANDARD,
      DURATIONS.fast,
    );
    expectTween(
      "new rows",
      progress(traceOf(views, next, opacity), 0, 1),
      EASE_STANDARD,
      DURATIONS.fast,
    );
  });

  test("a new anchor glides the card there on spring.smooth", async ({
    page,
  }) => {
    const run = await sampleClickOn(
      page,
      page.getByRole("radio", { name: "Right", exact: true }),
      CARD,
      700,
    );
    expectSpring(
      "anchor glide",
      travelled(run, (reading) => reading.left),
      "smooth",
    );
  });

  test("a section reset springs the card back on spring.smooth", async ({
    page,
  }) => {
    await page.getByRole("slider", { name: "Scale" }).focus();
    await page.keyboard.press("End");
    await page.waitForTimeout(800);
    const run = await sampleClickOn(
      page,
      page.getByRole("button", { name: "Reset Placement" }),
      CARD,
      700,
    );
    expectSpring(
      "reset",
      travelled(run, (reading) => reading.width),
      "smooth",
    );
  });

  test("a new canvas shape reshapes the stage on spring.smooth, the card keeping its shape in the middle", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /^Canvas shape/ }).click();
    await page.getByRole("option", { name: "Square · 1:1" }).waitFor();
    await page.waitForTimeout(400);
    const run = await sampleClickOn(
      page,
      page.getByRole("option", { name: "Square · 1:1" }),
      `${CANVAS}, ${CARD}`,
      700,
    );
    expectSpring(
      "canvas shape",
      travelled(run, (reading) => reading.height),
      "smooth",
    );
    for (const { elements } of run.frames) {
      const [canvas, card] = elements;
      if (!canvas || !card)
        throw new Error("The canvas or the card went missing.");
      expect(card.width / card.height).toBeCloseTo(1.6, 1);
      expect(card.left + card.width / 2).toBeCloseTo(
        canvas.left + canvas.width / 2,
        0,
      );
      expect(card.top + card.height / 2).toBeCloseTo(
        canvas.top + canvas.height / 2,
        0,
      );
    }
  });

  test("the canvas shape menu grows in on spring.snappy with a dur-base fade", async ({
    page,
  }) => {
    const run = await sampleClickOn(
      page,
      page.getByRole("button", { name: /^Canvas shape/ }),
      '[data-bt="Popover"]',
      600,
    );
    const fading = expectTween(
      "menu fading in",
      progress(trace(run, opacity), 0, 1),
      EASE_OUT,
      DURATIONS.base,
    );
    const growing = expectSpring(
      "menu growing",
      progress(
        trace(run, (reading) => reading.scale),
        ENTER_SCALE,
        1,
      ),
      "snappy",
    );
    expect(Math.abs(growing.start - fading.start)).toBeLessThanOrEqual(3);
    const [trigger, active] = await page
      .getByRole("button", { name: /^Canvas shape/ })
      .evaluate((element) => {
        const probe = document.createElement("span");
        probe.style.backgroundColor = "var(--bt-bg-control-active)";
        element.append(probe);
        const colors = [
          getComputedStyle(element).backgroundColor,
          getComputedStyle(probe).backgroundColor,
        ];
        probe.remove();
        return colors;
      });
    expect(trigger).toBe(active);
  });

  test("resize mode fades the background over dur-base and brings the handles in after the follow delay", async ({
    page,
  }) => {
    const run = await sampleClickOn(
      page,
      page.getByRole("button", { name: "Resize", exact: true }),
      `${BACKGROUND}, ${CROP}`,
      600,
    );
    const background = run.before.elements[0]?.id;
    const crop = elementIds(run).find((id) => id !== background);
    if (background === undefined || crop === undefined)
      throw new Error("Resize mode didn't start.");
    const fading = expectTween(
      "background fading out",
      progress(traceOf(run, background, opacity), 1, 0),
      EASE_STANDARD,
      DURATIONS.base,
    );
    const handles = expectTween(
      "handles fading in",
      progress(traceOf(run, crop, opacity), 0, 1),
      EASE_OUT,
      DURATIONS.fast,
    );
    const after = handles.start - fading.start;
    report(
      `the background starts fading ${ms(fading.start)} after the press, and the handles ${ms(after)} after that (80ms wanted)`,
    );
    expect(fading.start).toBeLessThanOrEqual(START_MAX);
    expect(after).toBeGreaterThanOrEqual(80 - FRAME);
    expect(after).toBeLessThanOrEqual(80 + FRAME);
  });

  test("the resize toolbar rises in on spring.smooth with a dur-base fade after the follow delay", async ({
    page,
  }) => {
    const run = await sampleClickOn(
      page,
      page.getByRole("button", { name: "Resize", exact: true }),
      '[data-bt-part="floating-toolbar-place"] > div',
      700,
    );
    const rising = expectSpringCurve(
      "toolbar rising",
      progress(
        trace(run, (reading) => reading.y),
        RISE,
        0,
      ),
      "smooth",
    );
    const fading = expectTween(
      "toolbar fading in",
      progress(trace(run, opacity), 0, 1),
      EASE_OUT,
      DURATIONS.base,
    );
    report(
      `toolbar starts ${ms(rising.start)} after the press (80ms delay wanted)`,
    );
    expect(rising.start).toBeGreaterThanOrEqual(80 - FRAME);
    expect(rising.start).toBeLessThanOrEqual(80 + TWO_FRAMES);
    expect(Math.abs(rising.start - fading.start)).toBeLessThanOrEqual(FRAME);
  });

  test("deleting the card swaps the stage for the empty state within a frame", async ({
    page,
  }) => {
    const frames = await page.evaluate(async () => {
      const remove = document.querySelector<HTMLElement>(
        '[data-bt="HeaderBar"] button[aria-label="Delete"]',
      );
      if (!remove) throw new Error("No Delete button.");
      remove.click();
      const seen: (readonly [boolean, boolean])[] = [];
      for (let frame = 0; frame < 4; frame += 1) {
        await new Promise((resolve) => requestAnimationFrame(resolve));
        seen.push([
          document.querySelector('[data-bt="EmptyState"]') !== null,
          document.querySelector('[data-bt="Stage"]') !== null,
        ]);
      }
      return seen;
    });
    expect(frames.findIndex(([empty, stage]) => empty && !stage)).toBe(0);
  });

  test("the card's removal toast rises on spring.snappy and fades in over dur-base", async ({
    page,
  }) => {
    const toast =
      '.bt-toaster > [data-bt-part="list"] > [data-bt-part="toast"]';
    const run = await sampleClickOn(
      page,
      page.getByRole("button", { name: "Delete", exact: true }),
      `${toast}, ${toast} > [data-bt-part="pill"]`,
      600,
    );
    const [item, pill] = elementIds(run);
    if (item === undefined || pill === undefined)
      throw new Error("No toast arrived.");
    const rising = expectSpring(
      "toast rising",
      progress(
        traceOf(run, pill, (reading) => reading.y),
        RISE,
        0,
      ),
      "snappy",
    );
    const fading = expectTween(
      "toast fading in",
      progress(traceOf(run, item, opacity), 0, 1),
      EASE_OUT,
      DURATIONS.base,
    );
    expect(Math.abs(rising.start - fading.start)).toBeLessThanOrEqual(FRAME);
  });
});
