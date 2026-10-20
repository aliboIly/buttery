import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
import {
  elementIds,
  finishSampling,
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
/** React's commit, Motion's first frame and a frame of sampling, on top of the spring's own time to 95%. */
const LATENCY = 50;
/** Two frames: by then, whatever lands at once has landed. */
const AT_ONCE = 34;
/** `AnimatePresence` unmounts exiting content a few frames after its fade. */
const EXIT_GONE_MAX = DURATIONS.fast + 50;

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

/** The progress follows spring `name` and reaches 95% of the travel in the spring's time plus `LATENCY`. */
function expectSpring(
  label: string,
  points: readonly Point[],
  name: SpringName,
): Fit {
  const fit = expectSpringCurve(label, points, name);
  const settle = settleTime(points);
  const own = springSettle(SPRINGS[name]);
  report(
    `${label}: 95% at ${ms(settle)} after the press (the spring alone takes ${ms(own)})`,
  );
  expect(settle).toBeGreaterThanOrEqual(own);
  expect(settle).toBeLessThanOrEqual(own + LATENCY);
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
    expectTween(
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
    expect(goneAt(run, old)).toBeLessThanOrEqual(EXIT_GONE_MAX);
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
      expectTween(
        `${preset} fading out`,
        progress(trace(exit, opacity), 1, 0),
        EASE_IN,
        DURATIONS.fast,
      );
      expect(goneAt(exit)).toBeLessThanOrEqual(EXIT_GONE_MAX);
      expect(goneAt(exit)).toBeLessThan(settledAt(enter));
      expectAtRest(exit);
    });
  }

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
    expect(rising.start - scrolled).toBeLessThanOrEqual(LATENCY);
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
      const fadeLeft = (CELEBRATION - last.t) / (CELEBRATION * 0.3);
      expect(last.reading.opacity).toBeLessThanOrEqual(
        Math.max(0, fadeLeft) + 0.1,
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
      ({ t }) => t >= AT_ONCE && t <= CELEBRATION - 50,
    );
    const after = run.frames.filter(({ t }) => t >= CELEBRATION + 20);
    expect(during.every(({ elements }) => elements.length > 0)).toBe(true);
    expect(after.every(({ elements }) => elements.length === 0)).toBe(true);
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
   * Samples `selector` while `act` starts an animation and the system setting turns to reduced motion
   * 80ms later. Returns the run and when the page heard about the switch.
   */
  async function switchMidway(
    page: Page,
    selector: string,
    act: () => Promise<void>,
  ): Promise<{ readonly run: Run; readonly switched: number }> {
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
    await page.waitForTimeout(80);
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
   * Moving before motion turned reduced, and exactly at rest two frames after, long before the spring
   * would have got there. Frames are stamped when they begin, so the frame that heard the switch can
   * already show it.
   */
  function expectLandedAtOnce(
    points: readonly Point[],
    switched: number,
  ): void {
    expect(
      framesBetween(points.filter(({ t }) => t < switched)),
    ).toBeGreaterThan(0);
    expect(
      points
        .filter(({ t }) => t >= switched + AT_ONCE)
        .every(({ value }) => value === 1),
    ).toBe(true);
  }

  test("a rising Presence lands in place and finishes its fade in 100ms", async ({
    page,
  }) => {
    const { run, switched } = await switchMidway(
      page,
      testId("presence-rise"),
      clickInPage(page, testId("presence-rise-toggle")),
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
        .filter(({ t }) => t >= switched + DURATIONS.reduced + AT_ONCE)
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
    );
    expect(
      run.frames
        .filter(({ t }) => t < switched)
        .some(({ elements }) =>
          elements.some(
            (reading) => reading.opacity > 0 && reading.opacity < 1,
          ),
        ),
    ).toBe(true);
    for (const { elements } of run.frames.filter(
      ({ t }) => t >= switched + AT_ONCE,
    )) {
      for (const reading of elements) {
        expect(reading.opacity).toBe(1);
        expect(reading.y).toBe(0);
      }
    }
  });
});
