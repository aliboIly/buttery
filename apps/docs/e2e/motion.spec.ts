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
  await page.goto(`/lab/motion?chrome=0${setting}`);
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

function animationsOf(
  run: Run,
  name: string,
): readonly (readonly [number, string])[] {
  return run.animations
    .filter((animation) => animation.name === name)
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
    await page.goto("/components/menu?chrome=0&motion=full");
    const trigger = page
      .getByRole("button", { name: "Manage card", exact: true })
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

  test("a context menu grows in from its corner on spring.snappy and leaves with a dur-fast fade", async ({
    page,
  }) => {
    const menu = '[data-bt="ContextMenu"]';
    await page.goto("/components/context-menu?chrome=0&motion=full");
    const card = page
      .getByRole("region", { name: "Café price list", exact: true })
      .first();
    await card.focus();
    await startSampling(page, menu);
    await page.keyboard.press("Shift+F10");
    const enter = await finishSampling(page, 700);
    const fading = expectTween(
      "context menu fading in",
      progress(trace(enter, opacity), 0, 1),
      EASE_OUT,
      DURATIONS.base,
    );
    const growing = expectSpring(
      "context menu growing",
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
    await expect(card).toBeFocused();
    const leaving = expectTween(
      "context menu fading out",
      progress(trace(exit, opacity), 1, 0),
      EASE_IN,
      DURATIONS.fast,
    );
    expectGoneSoonAfter(exit, leaving.start + DURATIONS.fast);
    expectAtRest(exit);
  });

  test("a dialog fades in over dur-fast growing from 97%, over a scrim that fades with it, and both leave over dur-fast", async ({
    page,
  }) => {
    await page.goto("/components/dialog?chrome=0&motion=full");
    const trigger = page
      .getByRole("button", { name: "Delete price list", exact: true })
      .first();
    await trigger.focus();
    await startSampling(page, '[data-bt="Dialog"]');
    await page.keyboard.press("Enter");
    const enter = await finishSampling(page, 500);
    const fading = expectTween(
      "dialog fading in",
      progress(trace(enter, opacity), 0, 1),
      EASE_OUT,
      DURATIONS.fast,
    );
    const growing = expectTween(
      "dialog growing",
      progress(
        trace(enter, (reading) => reading.scale),
        ENTER_SCALE,
        1,
      ),
      EASE_OUT,
      DURATIONS.fast,
    );
    expect(Math.abs(growing.start - fading.start)).toBeLessThanOrEqual(3);
    expect(fading.start).toBeLessThanOrEqual(START_MAX);
    await startSampling(page, '[data-bt="Dialog"]');
    await page.keyboard.press("Escape");
    const exit = await finishSampling(page, 400);
    await expect(trigger).toBeFocused();
    const leaving = expectTween(
      "dialog fading out",
      progress(trace(exit, opacity), 1, 0),
      EASE_IN,
      DURATIONS.fast,
    );
    expectGoneSoonAfter(exit, leaving.start + DURATIONS.fast);

    await startSampling(page, '[data-bt-part="scrim"]');
    await page.keyboard.press("Enter");
    const dim = await finishSampling(page, 500);
    const dimming = expectTween(
      "scrim fading in",
      progress(trace(dim, opacity), 0, 1),
      EASE_OUT,
      DURATIONS.fast,
    );
    expect(dimming.start).toBeLessThanOrEqual(START_MAX);
    await startSampling(page, '[data-bt-part="scrim"]');
    await page.keyboard.press("Escape");
    const clear = await finishSampling(page, 400);
    expectTween(
      "scrim fading out",
      progress(trace(clear, opacity), 1, 0),
      EASE_IN,
      DURATIONS.fast,
    );
  });

  test("a sheet slides in from beyond its edge on spring.smooth over a scrim that fades in over dur-base, and both leave over dur-fast", async ({
    page,
  }) => {
    await page.goto("/components/sheet?chrome=0&motion=full");
    const trigger = page
      .getByRole("button", { name: "Tomorrow's roast", exact: true })
      .first();
    await trigger.focus();
    await startSampling(page, '[data-bt="Sheet"]');
    await page.keyboard.press("Enter");
    const enter = await finishSampling(page, 700);
    const lefts = trace(enter, (reading) => reading.left);
    const last = enter.frames.at(-1)?.elements[0];
    if (!last) throw new Error("The sheet never opened.");
    const outside = last.left + last.width + 8;
    const sliding = expectSpring(
      "sheet sliding in",
      progress(lefts, outside, last.left),
      "smooth",
    );
    expect(sliding.start).toBeLessThanOrEqual(START_MAX);
    expect(lefts[0]?.value ?? 0).toBeGreaterThan(last.left + last.width / 2);
    for (const { elements } of enter.frames)
      for (const reading of elements) expect(reading.opacity).toBe(1);
    await startSampling(page, '[data-bt="Sheet"]');
    await page.keyboard.press("Escape");
    const exit = await finishSampling(page, 400);
    await expect(trigger).toBeFocused();
    const leaving = expectTween(
      "sheet sliding out",
      progress(
        trace(exit, (reading) => reading.left),
        last.left,
        outside,
      ),
      EASE_IN,
      DURATIONS.fast,
    );
    expectGoneSoonAfter(exit, leaving.start + DURATIONS.fast);

    await startSampling(page, '[data-bt-part="scrim"]');
    await page.keyboard.press("Enter");
    const dim = await finishSampling(page, 500);
    const dimming = expectTween(
      "scrim fading in",
      progress(trace(dim, opacity), 0, 1),
      EASE_OUT,
      DURATIONS.base,
    );
    expect(dimming.start).toBeLessThanOrEqual(START_MAX);
    await startSampling(page, '[data-bt-part="scrim"]');
    await page.keyboard.press("Escape");
    const clear = await finishSampling(page, 400);
    expectTween(
      "scrim fading out",
      progress(trace(clear, opacity), 1, 0),
      EASE_IN,
      DURATIONS.fast,
    );
  });

  test("a drawer follows a drag down in the frame it moves, and springs back on spring.smooth when let go short of closing", async ({
    page,
  }) => {
    await page.goto("/components/sheet?chrome=0&motion=full");
    await page
      .getByRole("button", { name: "From the bottom", exact: true })
      .first()
      .click();
    const drawer = page.getByRole("dialog", { name: "Tomorrow's roast" });
    await drawer.waitFor();
    await page.waitForFunction(() =>
      document.documentElement.hasAttribute("data-bt-settled"),
    );
    const rest = await drawer.boundingBox();
    if (!rest) throw new Error("The drawer isn't on the page.");
    const { x, y } = await centerOf(
      drawer.locator('[data-bt-part="sheet-handle"]'),
    );
    await page.mouse.move(x, y);
    await page.mouse.down();
    await startSampling(page, '[data-bt="Sheet"]');
    await page.mouse.move(x, y + 40);
    const held = await finishSampling(page, 150);
    const pulled = progress(
      trace(held, (reading) => reading.top),
      rest.y,
      rest.y + 40,
    );
    expect(framesBetween(pulled)).toBe(0);
    expect(pulled.at(-1)?.value).toBeCloseTo(1, 3);
    await startSampling(page, '[data-bt="Sheet"]');
    await page.mouse.up();
    const back = await finishSampling(page, 600);
    expectSpring(
      "drawer springing back",
      travelled(back, (reading) => reading.top),
      "smooth",
    );
    await expect(drawer).toBeVisible();
  });

  test("an onboarding's shared card travels to its next place on spring.smooth", async ({
    page,
  }) => {
    await page.goto("/patterns/onboarding?chrome=0&motion=full");
    await page
      .getByRole("button", { name: "Take the tour", exact: true })
      .first()
      .click();
    await page.getByRole("dialog").waitFor();
    await page.waitForTimeout(400);
    const next = page.getByRole("button", { name: "Next", exact: true });
    const before = await next.evaluate(() => {
      const card = document.querySelector('[data-bt-part="shared"]');
      if (!card) return 0;
      const box = card.getBoundingClientRect();
      return box.left + box.width / 2;
    });
    await next.focus();
    await startSampling(page, '[data-bt-part="shared"]');
    await page.keyboard.press("Enter");
    const run = await finishSampling(page, 700);
    const centers = trace(run, (reading) => reading.left + reading.width / 2);
    const after = centers.at(-1)?.value ?? before;
    expect(Math.abs(after - before)).toBeGreaterThan(8);
    expectSpring(
      "shared card travelling",
      progress(centers, before, after),
      "smooth",
    );
  });

  test("an expandable card grows into its dialog on spring.morph and goes back into the card on spring.smooth", async ({
    page,
  }) => {
    await page.goto("/components/expandable-card?chrome=0&motion=full");
    const card = '[data-bt="ExpandableCard"]';
    const expand = page
      .getByRole("button", { name: "Open Tilt it in 3D", exact: true })
      .first();
    const resting = await peek(page, card);
    if (!resting) throw new Error("There's no card to open.");
    await expand.focus();
    await startSampling(page, '[data-bt-part="panel"]');
    await page.keyboard.press("Enter");
    const opening = await finishSampling(page, 800);
    const growing = trace(opening, (reading) => reading.width);
    const open = growing.at(-1)?.value ?? resting.width;
    expect(open - resting.width).toBeGreaterThan(40);
    expectSpring(
      "card growing into its dialog",
      progress(growing, resting.width, open),
      "morph",
    );
    await startSampling(page, card);
    await page.keyboard.press("Escape");
    const closing = await finishSampling(page, 600);
    expectSpring(
      "dialog going back into the card",
      progress(
        trace(closing, (reading) => reading.width),
        open,
        resting.width,
      ),
      "smooth",
    );
    await expect(expand).toBeFocused();
  });

  test("a catalog card grows into its dialog on spring.morph and goes back into the card on spring.smooth", async ({
    page,
  }) => {
    await page.goto("/components/catalog?chrome=0&motion=full");
    const card = '[data-testid="live-demo"] [data-bt-part="catalog-card"]';
    const title = page
      .getByTestId("live-demo")
      .getByRole("button", { name: "Pour-over dripper", exact: true });
    await title.evaluate((element) => {
      element.scrollIntoView({ block: "center" });
    });
    const resting = await peek(page, card);
    if (!resting) throw new Error("There's no card to open.");
    await title.focus();
    await startSampling(page, '[data-bt-part="catalog-detail"]');
    await page.keyboard.press("Enter");
    const opening = await finishSampling(page, 800);
    const growing = trace(opening, (reading) => reading.width);
    const open = growing.at(-1)?.value ?? resting.width;
    expect(open - resting.width).toBeGreaterThan(40);
    expectSpring(
      "catalog card growing into its dialog",
      progress(growing, resting.width, open),
      "morph",
    );
    await startSampling(page, card);
    await page.keyboard.press("Escape");
    const closing = await finishSampling(page, 600);
    expectSpring(
      "dialog going back into the catalog card",
      progress(
        trace(closing, (reading) => reading.width),
        open,
        resting.width,
      ),
      "smooth",
    );
    await expect(title).toBeFocused();
  });

  test("a nav bar's menu unfolds from the bar in dur-fast with ease-out once the pointer has rested on its trigger for 150ms", async ({
    page,
  }) => {
    await page.goto("/components/nav-bar?chrome=0&motion=full");
    const panel = '[data-bt-part="panel"]';
    const body = `${panel} > [data-bt-part="body"]`;
    const product = page
      .getByRole("button", { name: "Product", exact: true })
      .first();
    await product.evaluate((element) => {
      element.scrollIntoView({ block: "start" });
    });
    // The page's first menu pays one-time costs (mounting Radix's viewport, a first blur); measure the open
    // every later visit gets.
    await product.hover();
    await page.locator(body).first().waitFor();
    await page.mouse.move(4, 4);
    await page.locator(body).first().waitFor({ state: "detached" });
    // Back on a trigger within 300ms of closing, a menu opens at once, as in any menu bar.
    await page.waitForTimeout(400);
    await startSampling(page, `${panel}, ${body}`, ["pointerover"]);
    await product.hover();
    const run = await finishSampling(page, 600);
    // The surface's fade and the body's height share one transition; the fade runs on the compositor, so
    // its curve is the precise one to fit, and the height has to keep up with it.
    const fading = expectTween(
      "panel unfolding (its fade)",
      progress(trace(run, opacity), 0, 1),
      EASE_OUT,
      DURATIONS.fast,
    );
    const heights = run.frames.flatMap(({ t, elements }) => {
      const reading = elements[1];
      return reading ? [{ t, value: reading.height }] : [];
    });
    const open = heights.at(-1)?.value ?? 0;
    expect(open).toBeGreaterThan(100);
    const grown = settleTime(progress(heights, 0, open));
    report(
      `panel unfolding: 95% of its height ${ms(grown - fading.start)} after it starts (dur-fast is ${String(DURATIONS.fast)}ms)`,
    );
    expect(grown - fading.start).toBeLessThanOrEqual(
      DURATIONS.fast + TWO_FRAMES,
    );
    const arrived = run.marks["pointerover"] ?? 0;
    report(
      `panel unfolding: starts ${ms(fading.start - arrived)} after the pointer arrives (150ms hover intent)`,
    );
    expect(fading.start - arrived).toBeGreaterThanOrEqual(150 - FRAME);
    expect(fading.start - arrived).toBeLessThanOrEqual(150 + TWO_FRAMES * 2);
  });

  test("moving to the next trigger reshapes the nav bar's panel at once on spring.snappy, and leaving folds it after 100ms in dur-fast with ease-in", async ({
    page,
  }) => {
    await page.goto("/components/nav-bar?chrome=0&motion=full");
    const panel = '[data-bt-part="panel"]';
    const product = page
      .getByRole("button", { name: "Product", exact: true })
      .first();
    await product.evaluate((element) => {
      element.scrollIntoView({ block: "start" });
    });
    await product.hover();
    await page.locator(panel).first().waitFor();
    await page.waitForTimeout(500);
    const before = await peek(page, panel);
    if (!before) throw new Error("The menu never opened.");
    await startSampling(page, panel);
    await page
      .getByRole("button", { name: "Guides", exact: true })
      .first()
      .hover();
    const switching = await finishSampling(page, 600);
    const widths = trace(switching, (reading) => reading.width);
    const after = widths.at(-1)?.value ?? before.width;
    expect(Math.abs(after - before.width)).toBeGreaterThan(40);
    expectSpring(
      "panel reshaping",
      progress(widths, before.width, after),
      "snappy",
    );

    const body = `${panel} > [data-bt-part="body"]`;
    const open = (await peek(page, body))?.height ?? 0;
    expect(open).toBeGreaterThan(100);
    await startSampling(page, `${panel}, ${body}`, ["pointerout"]);
    await page.mouse.move(4, 4);
    const closing = await finishSampling(page, 500);
    // As in the unfold, the fade is the precise channel of the shared transition; the height keeps up.
    const fold = expectTween(
      "panel folding (its fade)",
      progress(trace(closing, opacity), 1, 0),
      EASE_IN,
      DURATIONS.fast,
    );
    const heights = closing.frames.flatMap(({ t, elements }) => {
      const reading = elements[1];
      return reading ? [{ t, value: reading.height }] : [];
    });
    const folded = settleTime(progress(heights, open, 0));
    report(
      `panel folding: 95% folded ${ms(folded - fold.start)} after it starts (dur-fast is ${String(DURATIONS.fast)}ms)`,
    );
    expect(folded - fold.start).toBeLessThanOrEqual(
      DURATIONS.fast + TWO_FRAMES,
    );
    const left = closing.marks["pointerout"] ?? 0;
    report(
      `panel folding: starts ${ms(fold.start - left)} after the pointer leaves (100ms grace)`,
    );
    expect(fold.start - left).toBeGreaterThanOrEqual(100 - FRAME);
    expect(fold.start - left).toBeLessThanOrEqual(100 + TWO_FRAMES * 2);
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
  test("content in view as the page loads gets one 200ms fade from the first frame it's drawn in, without rising", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 2400 });
    await open(page, "full", testId("reveal"));
    const run = await finishSampling(page, 600);
    const drawn = run.frames.find(({ elements }) => elements.length > 0);
    expect(drawn?.elements[0]?.opacity).toBeLessThan(0.1);
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

  test("a sheet and its scrim fade in and out where it rests in 100ms", async ({
    page,
  }) => {
    await page.goto("/components/sheet?chrome=0&motion=reduced");
    const trigger = page
      .getByRole("button", { name: "Tomorrow's roast", exact: true })
      .first();
    await trigger.focus();
    for (const selector of ['[data-bt="Sheet"]', '[data-bt-part="scrim"]']) {
      await startSampling(page, selector);
      await page.keyboard.press("Enter");
      const enter = await finishSampling(page, 300);
      expectTween(
        `${selector} fading in`,
        progress(trace(enter, opacity), 0, 1),
        LINEAR,
        DURATIONS.reduced,
      );
      const lefts = new Set(
        trace(enter, (reading) => Math.round(reading.left)).map(
          ({ value }) => value,
        ),
      );
      expect(lefts.size).toBe(1);
      await startSampling(page, selector);
      await page.keyboard.press("Escape");
      const exit = await finishSampling(page, 300);
      expectTween(
        `${selector} fading out`,
        progress(trace(exit, opacity), 1, 0),
        LINEAR,
        DURATIONS.reduced,
      );
      await expect(trigger).toBeFocused();
    }
  });

  test("an expandable card's dialog fades in place in 100ms", async ({
    page,
  }) => {
    await page.goto("/components/expandable-card?chrome=0&motion=reduced");
    await page
      .getByRole("button", { name: "Open Tilt it in 3D", exact: true })
      .first()
      .focus();
    await startSampling(page, '[data-bt-part="panel"]');
    await page.keyboard.press("Enter");
    const run = await finishSampling(page, 300);
    expectTween(
      "expanded card fading in",
      progress(trace(run, opacity), 0, 1),
      LINEAR,
      DURATIONS.reduced,
    );
    expectAtRest(run);
    const widths = new Set(
      run.frames.flatMap(({ elements }) =>
        elements.map((reading) => Math.round(reading.width)),
      ),
    );
    expect(widths.size).toBe(1);
  });

  test("a catalog card's dialog fades in place in 100ms", async ({ page }) => {
    await page.goto("/components/catalog?chrome=0&motion=reduced");
    const title = page
      .getByTestId("live-demo")
      .getByRole("button", { name: "Pour-over dripper", exact: true });
    await title.evaluate((element) => {
      element.scrollIntoView({ block: "center" });
    });
    await title.focus();
    await startSampling(page, '[data-bt-part="catalog-detail"]');
    await page.keyboard.press("Enter");
    const run = await finishSampling(page, 300);
    expectTween(
      "catalog card's dialog fading in",
      progress(trace(run, opacity), 0, 1),
      LINEAR,
      DURATIONS.reduced,
    );
    expectAtRest(run);
    const widths = new Set(
      run.frames.flatMap(({ elements }) =>
        elements.map((reading) => Math.round(reading.width)),
      ),
    );
    expect(widths.size).toBe(1);
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
 * Drags `handle` in steps while reading, as each frame begins, where `control` is and how big `follower` is
 * drawn. A follower set in the same commit as the control is drawn by Motion during the frame, after this
 * read, so it shows one read later: `delay` is the most reads the follower took to follow a control move,
 * and `trailing` counts follower changes more than a read after the control's last move.
 */
async function followDrag(
  page: Page,
  handle: Locator,
  control: string,
  follower: string,
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
    ({ controlSelector, followerSelector }) => {
      const controlElement = document.querySelector(controlSelector);
      const followerElement = document.querySelector(followerSelector);
      if (!controlElement || !followerElement)
        throw new Error("No control or follower.");
      const probe = window as unknown as {
        followed: { control: number; follower: number }[];
        stopped: boolean;
      };
      probe.followed = [];
      probe.stopped = false;
      const read = (): void => {
        if (probe.stopped) return;
        const at = controlElement.getBoundingClientRect();
        const drawn = followerElement.getBoundingClientRect();
        probe.followed.push({
          control: Math.round((at.left + at.top * 1000) * 10),
          follower: Math.round((drawn.width + drawn.height * 1000) * 10),
        });
        requestAnimationFrame(read);
      };
      requestAnimationFrame(read);
    },
    { controlSelector: control, followerSelector: follower },
  );
  for (let step = 1; step <= 8; step += 1) {
    await page.mouse.move(x + (offset.x * step) / 8, y + (offset.y * step) / 8);
    await page.waitForTimeout(TWO_FRAMES);
  }
  await page.mouse.up();
  await page.waitForTimeout(300);
  const followed = await page.evaluate(() => {
    const probe = window as unknown as {
      followed: { control: number; follower: number }[];
      stopped: boolean;
    };
    probe.stopped = true;
    return probe.followed;
  });
  const changed = (pick: "control" | "follower"): number[] =>
    followed.flatMap((frame, index) => {
      const previous = followed[index - 1];
      return previous && frame[pick] !== previous[pick] ? [index] : [];
    });
  const moves = changed("control");
  const followerChanges = changed("follower");
  const delay = Math.max(
    0,
    ...moves.map((move) => {
      const next = followerChanges.find((index) => index >= move);
      return next === undefined ? Number.POSITIVE_INFINITY : next - move;
    }),
  );
  const lastMove = moves.at(-1) ?? 0;
  const trailing = followerChanges.filter(
    (index) => index > lastMove + 1,
  ).length;
  return { moved: moves.length, delay, trailing };
}

test.describe("Deckhand (MOTION_SPEC §3)", () => {
  const BOX = '[data-testid="stage-slide"] [data-dh-box]';
  const PLACE = '[data-testid="stage-slide"] .dh-slide-place';
  const CANVAS = '[data-bt="Stage"] > [data-bt-part="canvas"]';
  const BACKGROUND = `${CANVAS} > [data-bt-part="background"]`;
  const ALIGN_INDICATOR = '[aria-label="Align"] [data-bt-part="indicator"]';

  test.beforeEach(async ({ page }) => {
    await installSampler(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/demos/deckhand?chrome=0&motion=full");
    await page.getByTestId("stage-slide").waitFor();
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    await page.waitForTimeout(300);
  });

  async function pickSlide(page: Page, number: number): Promise<void> {
    await page
      .getByRole("option", { name: new RegExp(`^Slide ${String(number)}:`) })
      .click();
    await page.waitForTimeout(400);
  }

  function position(page: Page, name: string): Locator {
    return page
      .getByRole("radiogroup", { name: "Position" })
      .getByRole("radio", { name, exact: true });
  }

  test("a size drag changes the words in the same frame as the thumb, with nothing left to catch up", async ({
    page,
  }) => {
    const thumb = page.getByRole("slider", { name: "Size", exact: true });
    await thumb.evaluate((element) => {
      element.setAttribute("data-dragged", "");
    });
    const { moved, delay, trailing } = await followDrag(
      page,
      thumb,
      "[data-dragged]",
      BOX,
      { x: -100, y: 0 },
    );
    report(
      `Size drag: the thumb moved on ${String(moved)} frames; the words followed within ${String(delay)} read and changed ${String(trailing)} times after`,
    );
    expect(moved).toBeGreaterThanOrEqual(4);
    expect(delay).toBeLessThanOrEqual(1);
    expect(trailing).toBe(0);
  });

  test("a swatch swaps the background in one frame", async ({ page }) => {
    const frames = await page.evaluate(async (selector) => {
      const background = document.querySelector(selector);
      const swatch = [
        ...document.querySelectorAll<HTMLElement>('[role="radio"]'),
      ].find((element) => element.getAttribute("aria-label") === "Peach");
      if (!background || !swatch) throw new Error("No background or swatch.");
      const look = (): string => {
        const style = getComputedStyle(background);
        return `${style.backgroundColor} ${style.backgroundImage}`;
      };
      const before = look();
      swatch.click();
      const seen: boolean[] = [];
      for (let frame = 0; frame < 6; frame += 1) {
        await new Promise((resolve) => requestAnimationFrame(resolve));
        seen.push(look() !== before);
      }
      return seen;
    }, BACKGROUND);
    expect(frames.indexOf(true)).toBeGreaterThanOrEqual(0);
    expect(frames.indexOf(true)).toBeLessThanOrEqual(1);
  });

  test("the align control's indicator slides on spring.snappy", async ({
    page,
  }) => {
    const run = await sampleClickOn(
      page,
      page
        .getByRole("radiogroup", { name: "Align" })
        .getByRole("radio", { name: "Center" }),
      ALIGN_INDICATOR,
      500,
    );
    expectSpring(
      "align indicator",
      travelled(run, (reading) => reading.left),
      "snappy",
    );
  });

  test("a box crossfades the words' fill, ink and shadow over dur-base", async ({
    page,
  }) => {
    await pickSlide(page, 2);
    const run = await sampleClickOn(
      page,
      page
        .getByRole("radiogroup", { name: "Box" })
        .getByRole("radio", { name: "Dark" }),
      BOX,
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
    await pickSlide(page, 5);
    const thumb = page.getByRole("slider", { name: "Depth" });
    const shadow = (): Promise<string> =>
      page
        .locator(BOX)
        .evaluate((element) => getComputedStyle(element).boxShadow);
    const before = await shadow();
    const { x, y } = await centerOf(thumb);
    await page.mouse.move(x, y);
    await page.mouse.down();
    await startSampling(page, BOX);
    for (let step = 1; step <= 6; step += 1) {
      await page.mouse.move(x + 8 * step, y);
      await page.waitForTimeout(FRAME);
    }
    const run = await finishSampling(page, 100);
    await page.mouse.up();
    expect(transitionsOf(run, "box-shadow")).toEqual([]);
    expect(await shadow()).not.toBe(before);
  });

  test("switching the fill to a color crossfades the rows over dur-fast while the height follows on spring.smooth", async ({
    page,
  }) => {
    const morph = '[data-testid="look-section"] [data-bt="Morph"]';
    const height = await sampleClickOn(
      page,
      page
        .getByRole("radiogroup", { name: "Fill" })
        .getByRole("radio", { name: "Color" }),
      morph,
      700,
    );
    expectSpring(
      "swatch height",
      travelled(height, (reading) => reading.height),
      "smooth",
    );
    await page
      .getByRole("radiogroup", { name: "Fill" })
      .getByRole("radio", { name: "Gradient" })
      .click();
    await page.waitForTimeout(800);
    const views = await sampleClickOn(
      page,
      page
        .getByRole("radiogroup", { name: "Fill" })
        .getByRole("radio", { name: "Color" }),
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

  test("a new position glides the words there on spring.smooth", async ({
    page,
  }) => {
    const run = await sampleClickOn(page, position(page, "Right"), PLACE, 700);
    expectSpring(
      "position glide",
      travelled(run, (reading) => reading.left),
      "smooth",
    );
  });

  test("the slide section's reset springs the words back on spring.smooth", async ({
    page,
  }) => {
    await position(page, "Top right").click();
    await page.waitForTimeout(800);
    const run = await sampleClickOn(
      page,
      page.getByRole("button", { name: "Reset Slide" }),
      PLACE,
      700,
    );
    expectSpring(
      "reset",
      travelled(run, (reading) => reading.left),
      "smooth",
    );
  });

  test("a new slide size reshapes the stage on spring.smooth, the words keeping their shape", async ({
    page,
  }) => {
    await page.getByRole("combobox", { name: /^Slide size/ }).click();
    await page.getByRole("option", { name: "Square · 1:1" }).waitFor();
    await page.waitForTimeout(400);
    const run = await sampleClickOn(
      page,
      page.getByRole("option", { name: "Square · 1:1" }),
      `${CANVAS}, ${BOX}`,
      700,
    );
    expectSpring(
      "slide size",
      travelled(run, (reading) => reading.height),
      "smooth",
    );
    const [, startBox] = run.before.elements;
    if (!startBox) throw new Error("The words went missing.");
    const shape = startBox.width / startBox.height;
    for (const { elements } of run.frames) {
      const [canvas, box] = elements;
      if (!canvas || !box)
        throw new Error("The canvas or the words went missing.");
      expect(box.width / box.height).toBeCloseTo(shape, 1);
      expect(box.left).toBeGreaterThanOrEqual(canvas.left - 1);
      expect(box.top + box.height).toBeLessThanOrEqual(
        canvas.top + canvas.height + 1,
      );
    }
  });

  test("the slide size list grows in on spring.snappy with a dur-base fade", async ({
    page,
  }) => {
    const run = await sampleClickOn(
      page,
      page.getByRole("combobox", { name: /^Slide size/ }),
      '[data-bt="Popover"]',
      600,
    );
    const fading = expectTween(
      "list fading in",
      progress(trace(run, opacity), 0, 1),
      EASE_OUT,
      DURATIONS.base,
    );
    const growing = expectSpring(
      "list growing",
      progress(
        trace(run, (reading) => reading.scale),
        ENTER_SCALE,
        1,
      ),
      "snappy",
    );
    expect(Math.abs(growing.start - fading.start)).toBeLessThanOrEqual(3);
    const [trigger, active] = await page
      .getByRole("combobox", { name: /^Slide size/ })
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

  test("arrange mode's toolbar rises in on spring.smooth with a dur-base fade after the follow delay", async ({
    page,
  }) => {
    const run = await sampleClickOn(
      page,
      page.getByRole("button", { name: "Arrange", exact: true }),
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

  test("deleting the last slide swaps the stage for the empty state within a frame", async ({
    page,
  }) => {
    const remove = page.getByRole("button", {
      name: "Delete slide",
      exact: true,
    });
    for (let count = 6; count > 1; count -= 1) {
      await remove.click();
      await expect(page.getByRole("option")).toHaveCount(count - 1);
    }
    const frames = await page.evaluate(async () => {
      const button = document.querySelector<HTMLElement>(
        '[data-bt="HeaderBar"] button[aria-label="Delete slide"]',
      );
      if (!button) throw new Error("No Delete slide button.");
      button.click();
      const seen: (readonly [boolean, boolean])[] = [];
      for (let frame = 0; frame < 4; frame += 1) {
        await new Promise((resolve) => requestAnimationFrame(resolve));
        seen.push([
          document.querySelector('main [data-bt="EmptyState"]') !== null,
          document.querySelector('[data-bt="Stage"]') !== null,
        ]);
      }
      return seen;
    });
    expect(frames.findIndex(([empty, stage]) => empty && !stage)).toBe(0);
  });

  test("a slide's removal toast rises on spring.snappy and fades in over dur-base", async ({
    page,
  }) => {
    const toast =
      '.bt-toaster > [data-bt-part="list"] > [data-bt-part="toast"]';
    const run = await sampleClickOn(
      page,
      page.getByRole("button", { name: "Delete slide", exact: true }),
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

test.describe("Tilt and crop on their docs pages (MOTION_SPEC §3)", () => {
  test.beforeEach(async ({ page }) => {
    await installSampler(page);
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  async function openPage(page: Page, path: string): Promise<void> {
    await page.goto(`${path}?motion=full`);
    await page.getByRole("heading", { level: 1 }).waitFor();
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    await page.waitForTimeout(300);
  }

  test("a lean drag turns a card in the same frame as the knob, with nothing left to catch up", async ({
    page,
  }) => {
    await openPage(page, "/components/tilt-pad");
    const example = page
      .getByRole("region", { name: "TiltPad examples" })
      .locator("[data-docs-example]")
      .filter({ has: page.getByRole("status", { name: "Picture preview" }) });
    await example.scrollIntoViewIfNeeded();
    await example.locator('[data-bt-part="knob"]').evaluate((element) => {
      element.setAttribute("data-follow-control", "");
    });
    await example
      .getByRole("status", { name: "Picture preview" })
      .evaluate((element) => {
        element.setAttribute("data-follow-card", "");
      });
    const { moved, delay, trailing } = await followDrag(
      page,
      example.getByRole("group", { name: "Tilt" }),
      "[data-follow-control]",
      "[data-follow-card]",
      { x: 24, y: -12 },
    );
    report(
      `Lean drag: the knob moved on ${String(moved)} frames; the card followed within ${String(delay)} read and changed ${String(trailing)} times after`,
    );
    expect(moved).toBeGreaterThanOrEqual(4);
    expect(delay).toBeLessThanOrEqual(1);
    expect(trailing).toBe(0);
  });

  test("the Flat chip lays a leaning pad flat on spring.smooth", async ({
    page,
  }) => {
    await openPage(page, "/components/tilt-pad");
    const demo = page.getByRole("region", {
      name: "TiltPad variants and states",
    });
    await demo.scrollIntoViewIfNeeded();
    const leans = await demo.evaluate(async (section) => {
      const knob = section.querySelector<HTMLElement>('[data-bt-part="knob"]');
      const chip = [...section.querySelectorAll<HTMLElement>("button")].find(
        (button) => button.textContent.trim() === "Flat",
      );
      if (!knob || !chip) throw new Error("No knob or Flat chip.");
      const lean = (): number =>
        Number(knob.style.getPropertyValue("--bt-tilt-pad-x"));
      const start = lean();
      const pressed = performance.now();
      chip.click();
      const read: { t: number; value: number }[] = [];
      while (performance.now() - pressed < 700) {
        const t = await new Promise<number>((resolve) => {
          requestAnimationFrame(resolve);
        });
        read.push({ t: t - pressed, value: lean() });
      }
      return { start, read };
    });
    expect(leans.start).toBeCloseTo(0.4, 2);
    expectSpring(
      "lean back to flat",
      progress(leans.read, leans.start, 0),
      "smooth",
    );
  });

  test("crop mode fades the canvas's background over dur-base and brings the handles in after the follow delay", async ({
    page,
  }) => {
    await openPage(page, "/patterns/inspector");
    const demo = page.getByRole("region", {
      name: "Stage variants and states",
    });
    await demo.scrollIntoViewIfNeeded();
    await demo.locator('[data-bt="Stage"]').evaluate((element) => {
      element.setAttribute("data-sampled-stage", "");
    });
    const canvas = '[data-sampled-stage] > [data-bt-part="canvas"]';
    const run = await sampleClickOn(
      page,
      demo.getByRole("button", { name: "Resize", exact: true }),
      `${canvas} > [data-bt-part="background"], ${canvas} > [data-bt-part="crop"]`,
      600,
    );
    const background = run.before.elements[0]?.id;
    const crop = elementIds(run).find((id) => id !== background);
    if (background === undefined || crop === undefined)
      throw new Error("Crop mode didn't start.");
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
});

test.describe("App chrome (MOTION_SPEC §3)", () => {
  test.beforeEach(async ({ page }) => {
    await installSampler(page);
    await page.addInitScript(() => {
      localStorage.setItem(
        "buttery:announcement:roastery-roast-planning",
        "true",
      );
      localStorage.setItem("buttery:nudge:roastery-delivery-questions", "true");
    });
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  async function openDemo(page: Page, path: string): Promise<void> {
    await page.goto(`/demos/roastery${path}?motion=full`);
    await page.locator("h1").first().waitFor();
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    await page.waitForTimeout(300);
  }

  /** The frames from the one starting at or after `mark`, the moment the input arrived. */
  function framesFrom(run: Run, mark: string): Run["frames"] {
    const at = run.marks[mark];
    if (at === undefined) throw new Error(`No ${mark} was marked.`);
    return run.frames.filter(({ t }) => t >= at);
  }

  test("a chrome menu is complete in the first frame it shows in, the frame after the key, and gone the frame after Escape", async ({
    page,
  }) => {
    await openDemo(page, "/orders");
    const menu = '[data-bt="Menu"]';
    const trigger = page
      .getByRole("button", { name: /^Actions for ord_/ })
      .first();
    await trigger.focus();
    await startSampling(page, menu, ["keydown"]);
    await page.keyboard.press("Enter");
    const opening = framesFrom(await finishSampling(page, 300), "keydown");
    const shown = opening.findIndex(({ elements }) => elements.length > 0);
    report(`chrome menu: shows ${String(shown)} frames after the key`);
    expect(shown).toBeGreaterThanOrEqual(0);
    expect(shown).toBeLessThanOrEqual(1);
    for (const { elements } of opening.slice(shown)) {
      for (const reading of elements) {
        expect(reading.opacity).toBe(1);
        expect(reading.scale).toBe(1);
      }
    }
    await startSampling(page, menu, ["keydown"]);
    await page.keyboard.press("Escape");
    const closing = framesFrom(await finishSampling(page, 300), "keydown");
    // It unmounts as it closes; a frame where it's still there but transparent counts as gone too.
    const gone = closing.findIndex(({ elements }) =>
      elements.every((reading) => reading.opacity === 0),
    );
    report(`chrome menu: gone ${String(gone)} frames after Escape`);
    expect(gone).toBeGreaterThanOrEqual(0);
    expect(gone).toBeLessThanOrEqual(1);
    for (const { elements } of closing.slice(0, gone)) {
      for (const reading of elements) expect(reading.opacity).toBe(1);
    }
    await expect(trigger).toBeFocused();
  });

  test("a submenu opens 40ms after the pointer rests on its item, fading in over dur-fast", async ({
    page,
  }) => {
    await openDemo(page, "");
    await page
      .getByRole("button", { name: "Workspace: Halfmoon Roastery" })
      .focus();
    await page.keyboard.press("Enter");
    const item = page.getByRole("menuitem", { name: "Switch workspace" });
    await item.waitFor();
    await startSampling(page, '[data-bt="Menu"]', ["pointermove"]);
    await item.hover();
    const run = await finishSampling(page, 500);
    const [, submenu] = elementIds(run);
    if (submenu === undefined) throw new Error("The submenu never opened.");
    const fading = expectTween(
      "submenu fading in",
      progress(traceOf(run, submenu, opacity), 0, 1),
      EASE_OUT,
      DURATIONS.fast,
    );
    const arrived = run.marks["pointermove"] ?? 0;
    const full = traceOf(run, submenu, opacity).find(
      (point) => point.value >= 0.99,
    );
    report(
      `submenu: starts ${ms(fading.start - arrived)} after the pointer arrives (40ms wanted), fully in at ${ms((full?.t ?? Number.NaN) - arrived)}`,
    );
    expect(fading.start - arrived).toBeGreaterThanOrEqual(40 - FRAME);
    expect(fading.start - arrived).toBeLessThanOrEqual(40 + FRAME);
    expect((full?.t ?? Number.POSITIVE_INFINITY) - arrived).toBeLessThanOrEqual(
      40 + DURATIONS.fast + TWO_FRAMES,
    );
  });

  test("a dialog in the app fades in over dur-fast growing from 97%, and fades out over dur-fast", async ({
    page,
  }) => {
    await openDemo(page, "/orders");
    const trigger = page
      .getByRole("button", { name: "New order", exact: true })
      .first();
    await trigger.focus();
    await startSampling(page, '[data-bt="Dialog"]');
    await page.keyboard.press("Enter");
    const enter = await finishSampling(page, 500);
    const fading = expectTween(
      "dialog fading in",
      progress(trace(enter, opacity), 0, 1),
      EASE_OUT,
      DURATIONS.fast,
    );
    const growing = expectTween(
      "dialog growing",
      progress(
        trace(enter, (reading) => reading.scale),
        ENTER_SCALE,
        1,
      ),
      EASE_OUT,
      DURATIONS.fast,
    );
    expect(Math.abs(growing.start - fading.start)).toBeLessThanOrEqual(3);
    await startSampling(page, '[data-bt="Dialog"]');
    await page.keyboard.press("Escape");
    const exit = await finishSampling(page, 400);
    const leaving = expectTween(
      "dialog fading out",
      progress(trace(exit, opacity), 1, 0),
      EASE_IN,
      DURATIONS.fast,
    );
    expectGoneSoonAfter(exit, leaving.start + DURATIONS.fast);
    expectAtRest(exit);
  });

  test("a sidebar group opens on spring.snappy and closes over dur-fast with ease-standard", async ({
    page,
  }) => {
    await openDemo(page, "/orders");
    const header = page.getByRole("button", { name: "Wholesale", exact: true });
    const morph =
      '[data-bt="Sidebar"] .bt-sidebar-group:has(> [data-bt-part="item"] [title="Wholesale"]) [data-bt="Morph"]';
    await header.focus();
    await startSampling(page, morph);
    await page.keyboard.press("Enter");
    const opening = await finishSampling(page, 600);
    const heights = trace(opening, (reading) => reading.height);
    const open = heights.at(-1)?.value ?? 0;
    expect(open).toBeGreaterThan(40);
    expectSpring("sidebar group opening", progress(heights, 0, open), "snappy");
    const view = `${morph} > [data-bt-part="content"] > [data-bt-part="view"]`;
    await startSampling(page, `${morph}, ${view}`);
    await page.keyboard.press("Enter");
    const closing = await finishSampling(page, 400);
    const [box, leaving] = elementIds(closing);
    if (box === undefined || leaving === undefined)
      throw new Error("The group's items weren't there.");
    // The items' fade shares the height's transition and runs on the compositor, so its curve is the precise
    // one to fit; the height, moved on the main thread, has to keep up with it.
    const fading = expectTween(
      "sidebar group closing (its items' fade)",
      progress(traceOf(closing, leaving, opacity), 1, 0),
      EASE_STANDARD,
      DURATIONS.fast,
    );
    // A frame is read before the ResizeObserver puts the old height back, so the first frame after the press
    // can read 0 though it paints the old height. The height is gone from the frame after its last open one.
    const closingHeights = traceOf(closing, box, (reading) => reading.height);
    const lastOpen = closingHeights.findLastIndex((point) => point.value > 0.5);
    const shut = closingHeights[lastOpen + 1]?.t ?? Number.POSITIVE_INFINITY;
    report(
      `sidebar group closing: all of its height gone ${ms(shut - fading.start)} after it starts (dur-fast is ${String(DURATIONS.fast)}ms)`,
    );
    // The height moves on the main thread and can trail the fade by a frame or two, never more, and it
    // takes about as long as the fade: a collapse that's over at once fails.
    expect(shut - fading.start).toBeLessThanOrEqual(
      DURATIONS.fast + TWO_FRAMES,
    );
    expect(shut - fading.start).toBeGreaterThanOrEqual(
      DURATIONS.fast - TWO_FRAMES,
    );
  });

  test("a chart's crosshair and tooltip follow the pointer in the frame it moves in", async ({
    page,
  }) => {
    await openDemo(page, "");
    const plot = page.getByRole("slider", { name: "Sales" });
    await plot.scrollIntoViewIfNeeded();
    const box = await plot.boundingBox();
    if (!box) throw new Error("No chart.");
    const readings = await plot.evaluate(async (element, area) => {
      const frame = element.closest(".bt-chart-frame");
      const crosshair = frame?.querySelector<HTMLElement>(
        '[data-bt-part="crosshair"]',
      );
      const tooltip = frame?.querySelector<HTMLElement>(
        '[data-bt-part="tooltip"]',
      );
      if (!crosshair || !tooltip) throw new Error("No crosshair.");
      const last = Number(element.getAttribute("aria-valuemax"));
      const seen: {
        readonly now: number;
        readonly next: number;
        readonly shown: boolean;
        readonly center: number;
        readonly nearest: number;
        readonly tipLeft: number;
        readonly tipRight: number;
        readonly tipNext: number;
        readonly date: string;
        readonly label: string;
        readonly frameRight: number;
      }[] = [];
      for (const share of [0.1, 0.35, 0.6, 0.9]) {
        element.dispatchEvent(
          new PointerEvent("pointermove", {
            bubbles: true,
            pointerType: "mouse",
            clientX: area.x + area.width * share,
            clientY: area.y + area.height / 2,
          }),
        );
        const box = crosshair.getBoundingClientRect();
        const tip = tooltip.getBoundingClientRect();
        const date =
          tooltip.querySelector('[data-bt-part="tooltip-date"]')?.textContent ??
          "";
        await new Promise((resolve) => requestAnimationFrame(resolve));
        seen.push({
          now: box.left,
          next: crosshair.getBoundingClientRect().left,
          shown: !tooltip.hidden && !crosshair.hidden,
          center: box.left + box.width / 2,
          nearest: area.x + (Math.round(share * last) / last) * area.width,
          tipLeft: tip.left,
          tipRight: tip.right,
          tipNext: tooltip.getBoundingClientRect().left,
          date,
          label:
            frame?.querySelectorAll('tbody th[scope="row"]')[
              Math.round(share * last)
            ]?.textContent ?? "",
          frameRight: frame?.getBoundingClientRect().right ?? 0,
        });
      }
      return seen;
    }, box);
    for (const reading of readings) {
      expect(reading.shown).toBe(true);
      expect(reading.next).toBe(reading.now);
      expect(Math.abs(reading.center - reading.nearest)).toBeLessThanOrEqual(1);
      // The tooltip moved in the same handler, so the next frame shows it where it was read.
      expect(reading.tipNext).toBe(reading.tipLeft);
      expect(reading.date).not.toBe("");
      expect(reading.date).toBe(reading.label);
    }
    const lefts = readings.map(({ now }) => now);
    expect(new Set(lefts).size).toBe(lefts.length);
    expect(new Set(readings.map(({ date }) => date)).size).toBe(
      readings.length,
    );
    const [first] = readings;
    const last = readings.at(-1);
    if (!first || !last) throw new Error("No readings.");
    // 8px to the right of the crosshair, until that would cross the chart's edge; then 8px to its left.
    expect(Math.abs(first.tipLeft - (first.center + 8))).toBeLessThanOrEqual(1);
    expect(first.center + 8 + (last.tipRight - last.tipLeft)).toBeLessThan(
      first.frameRight,
    );
    expect(last.center + 8 + (last.tipRight - last.tipLeft)).toBeGreaterThan(
      last.frameRight,
    );
    expect(Math.abs(last.tipRight - (last.center - 8))).toBeLessThanOrEqual(1);
  });

  /**
   * Every sampled element's edges, each held within 1px through the run. By `"slot"`, the nth element
   * matched is compared with the nth in every frame, so a skeleton and what replaces it count as one.
   */
  function expectStill(run: Run, by: "element" | "slot" = "element"): void {
    const edges = new Map<number, number[][]>();
    const counts = new Set(run.frames.map(({ elements }) => elements.length));
    if (by === "slot") expect([...counts]).toHaveLength(1);
    for (const { elements } of run.frames) {
      for (const [slot, reading] of elements.entries()) {
        const key = by === "slot" ? slot : reading.id;
        const seen = edges.get(key) ?? [[], [], [], []];
        seen[0]?.push(reading.top);
        seen[1]?.push(reading.top + reading.height);
        seen[2]?.push(reading.left);
        seen[3]?.push(reading.left + reading.width);
        edges.set(key, seen);
      }
    }
    expect(edges.size).toBeGreaterThan(0);
    for (const sides of edges.values()) {
      for (const side of sides)
        expect(Math.max(...side) - Math.min(...side)).toBeLessThanOrEqual(1);
    }
  }

  for (const comparison of ["Previous period", "No comparison"] as const) {
    test(`the overview's cards turn from skeletons into their numbers in place, nothing moving more than 1px, ${comparison === "No comparison" ? "with no comparison" : "compared with the previous period"}`, async ({
      page,
    }) => {
      await openDemo(page, "");
      const cards = '[data-bt="AppPage"] [data-bt="MetricCard"]';
      if (comparison === "No comparison") {
        await page.getByRole("combobox", { name: /^Comparison/ }).click();
        await page
          .getByRole("option", { name: "No comparison", exact: true })
          .click();
        await expect(page.locator(`${cards}[aria-busy="true"]`)).toHaveCount(0);
      }
      await page.getByRole("combobox", { name: /^Date range/ }).click();
      await page
        .getByRole("option", { name: "Last 4 weeks", exact: true })
        .click();
      await expect(page.locator(`${cards}[aria-busy="true"]`)).toHaveCount(4);
      await startSampling(
        page,
        `${cards}, ${cards} > [data-bt-part="head"] > [data-bt="Morph"], ${cards} .bt-chart-frame, ${cards} > [data-bt-part="foot"]`,
      );
      const run = await finishSampling(page, 1600);
      await expect(page.locator(`${cards}[aria-busy="true"]`)).toHaveCount(0);
      expectStill(run);
    });
  }

  test("the orders table turns its skeleton rows into orders in place, nothing moving more than 1px", async ({
    page,
  }) => {
    await openDemo(page, "/orders");
    const table = '[data-bt="DataTable"]';
    await page.getByRole("radio", { name: "To roast", exact: true }).click();
    await expect(page.locator(`${table} [aria-busy="true"]`)).toHaveCount(1);
    await startSampling(
      page,
      `${table}, ${table} [role="columnheader"], ${table} [data-bt-part="data-table-body"] > :nth-child(2 of [data-bt-part="data-table-row"]), ${table} > [data-bt-part="pagination"]`,
    );
    const run = await finishSampling(page, 1300);
    await expect(page.locator(`${table} [aria-busy="true"]`)).toHaveCount(0);
    expectStill(run, "slot");
  });

  test("a metric's skeleton turns into its numbers in place, nothing moving more than 1px", async ({
    page,
  }) => {
    await page.goto("/components/metric-card?chrome=0&motion=full");
    // The example whose numbers arrive after a moment; the page's Loading demo stays a skeleton.
    const card = page
      .locator(".bt-metric-card")
      .filter({ hasText: "Bags roasted" });
    await expect(card).toHaveAttribute("aria-busy", "true");
    await card.evaluate((element) => {
      element.setAttribute("data-testid", "loads");
    });
    await page.evaluate(async () => {
      await document.fonts.ready;
      for (let frame = 0; frame < 2; frame += 1)
        await new Promise((resolve) => requestAnimationFrame(resolve));
    });
    const loads = testId("loads");
    await startSampling(
      page,
      `${loads}, ${loads} .bt-chart-frame, ${loads} [data-bt-part="foot"]`,
    );
    const run = await finishSampling(page, 2200);
    await expect(card).not.toHaveAttribute("aria-busy", "true");
    const loaded = run.frames.at(-1)?.elements.length ?? 0;
    expect(loaded).toBeGreaterThan(0);
    const tops = new Map<number, number[]>();
    for (const { elements } of run.frames) {
      for (const reading of elements) {
        const seen = tops.get(reading.id) ?? [];
        seen.push(reading.top, reading.top + reading.height);
        tops.set(reading.id, seen);
      }
    }
    for (const edges of tops.values()) {
      const tops0 = edges.filter((_, index) => index % 2 === 0);
      const bottoms = edges.filter((_, index) => index % 2 === 1);
      expect(Math.max(...tops0) - Math.min(...tops0)).toBeLessThanOrEqual(1);
      expect(Math.max(...bottoms) - Math.min(...bottoms)).toBeLessThanOrEqual(
        1,
      );
    }
  });

  test("a form dialog rises 4px as it fades in over dur-fast, waits on itself, then focuses its field once it has settled", async ({
    page,
  }) => {
    await openDemo(page, "/settings/team");
    await page.getByRole("button", { name: "Invite someone" }).focus();
    await startSampling(page, '[data-bt="Dialog"]');
    await page.keyboard.press("Enter");
    const focusDuring = await page.evaluate(
      () => document.activeElement?.getAttribute("role") ?? "",
    );
    const enter = await finishSampling(page, 500);
    expectTween(
      "form dialog rising",
      progress(
        trace(enter, (reading) => reading.y),
        4,
        0,
      ),
      EASE_OUT,
      DURATIONS.fast,
    );
    expect(focusDuring).toBe("dialog");
    await expect(
      page.getByRole("textbox", { name: "Email address" }),
    ).toBeFocused();
    await startSampling(page, '[data-bt="Dialog"]');
    await page.keyboard.press("Escape");
    const exit = await finishSampling(page, 400);
    expectTween(
      "form dialog fading out",
      progress(trace(exit, opacity), 1, 0),
      EASE_IN,
      DURATIONS.fast,
    );
  });

  test("a full-screen dialog fades in and out over dur-fast without growing, rising or shrinking", async ({
    page,
  }) => {
    await page.goto("/components/fullscreen-dialog?motion=full");
    await page.locator("h1").first().waitFor();
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    const dialog = '[data-bt="Dialog"][data-size="full"]';
    await page
      .getByRole("button", { name: "Set up the roastery", exact: true })
      .first()
      .focus();
    await startSampling(page, dialog);
    await page.keyboard.press("Enter");
    const enter = await finishSampling(page, 400);
    expectTween(
      "full-screen dialog fading in",
      progress(trace(enter, opacity), 0, 1),
      EASE_OUT,
      DURATIONS.fast,
    );
    expectAtRest(enter);
    await startSampling(page, dialog);
    await page.keyboard.press("Escape");
    const exit = await finishSampling(page, 400);
    const leaving = expectTween(
      "full-screen dialog fading out",
      progress(trace(exit, opacity), 1, 0),
      EASE_IN,
      DURATIONS.fast,
    );
    expectGoneSoonAfter(exit, leaving.start + DURATIONS.fast);
    expectAtRest(exit);
  });

  test("a side panel docks in one frame, the page narrowing in that frame, and fades its content in over dur-fast", async ({
    page,
  }) => {
    await openDemo(page, "");
    const column = '[data-bt="AppShell"] > [data-bt-part="column"]';
    const panel = '[data-bt="SidePanel"]';
    const content = `${panel} > [data-bt-part="content"]`;
    await page.getByRole("button", { name: "Help", exact: true }).focus();
    await startSampling(page, `${column}, ${panel}, ${content}`, ["keydown"]);
    await page.keyboard.press("Enter");
    const opening = await finishSampling(page, 400);
    const [columnId, panelId, contentId] = elementIds(opening);
    if (
      columnId === undefined ||
      panelId === undefined ||
      contentId === undefined
    )
      throw new Error("The panel didn't dock.");
    const wide = opening.before.elements[0]?.width ?? 0;
    const frames = framesFrom(opening, "keydown");
    const docked = frames.findIndex(({ elements }) =>
      elements.some(({ id }) => id === panelId),
    );
    report(`side panel: docks ${String(docked)} frames after the key`);
    expect(docked).toBeGreaterThanOrEqual(0);
    expect(docked).toBeLessThanOrEqual(1);
    for (const [index, { elements }] of frames.entries()) {
      const columnNow = elements.find(({ id }) => id === columnId);
      const panelNow = elements.find(({ id }) => id === panelId);
      if (index < docked) expect(columnNow?.width).toBe(wide);
      else {
        expect(columnNow?.width).toBe(wide - 360);
        expect(panelNow?.width).toBe(360);
        expect(panelNow?.opacity).toBe(1);
      }
    }
    // A CSS animation reports the timing it runs on; the frames, a handful for 120ms, check its curve.
    expect(animationsOf(opening, "bt-side-panel-in")).toEqual([
      [DURATIONS.fast, CSS_EASE_OUT],
    ]);
    const fade = fitTween(
      progress(traceOf(opening, contentId, opacity), 0, 1),
      EASE_OUT,
    );
    report(
      `side panel content fading in: ${String(DURATIONS.fast)}ms, within ${fade.error.toFixed(1)}ms over ${String(fade.frames)} frames`,
    );
    expect(fade.error).toBeLessThanOrEqual(CURVE_ERROR);
    await startSampling(page, `${column}, ${panel}`, ["keydown"]);
    await page.keyboard.press("Escape");
    const closing = framesFrom(await finishSampling(page, 300), "keydown");
    const gone = closing.findIndex(
      ({ elements }) => !elements.some(({ id }) => id === panelId),
    );
    report(`side panel: gone ${String(gone)} frames after Escape`);
    expect(gone).toBeGreaterThanOrEqual(0);
    expect(gone).toBeLessThanOrEqual(1);
    for (const { elements } of closing.slice(gone))
      expect(elements.find(({ id }) => id === columnId)?.width).toBe(wide);
  });

  test("the search field widens from 360 to 600 on spring.smooth, its icon keeping its size, over a panel complete in its first frame", async ({
    page,
  }) => {
    await openDemo(page, "/orders");
    const field = '[data-bt="CommandSearch"]';
    const icon = `${field} > [data-bt-part="icon"]`;
    const panel = ".bt-command-search-panel";
    await startSampling(page, `${field}, ${icon}, ${panel}`, ["keydown"]);
    await page.keyboard.press("/");
    const run = await finishSampling(page, 700);
    const [fieldId, iconId, panelId] = elementIds(run);
    if (fieldId === undefined || iconId === undefined || panelId === undefined)
      throw new Error("The field or its panel wasn't there.");
    expectSpring(
      "search field widening",
      progress(
        traceOf(run, fieldId, (reading) => reading.width),
        360,
        600,
      ),
      "smooth",
    );
    for (const { reading } of readingsOf(run, iconId))
      expect(Math.abs(reading.width - 16)).toBeLessThanOrEqual(0.5);
    const opened = framesFrom(run, "keydown").findIndex(({ elements }) =>
      elements.some(({ id }) => id === panelId),
    );
    report(`search panel: shows ${String(opened)} frames after the key`);
    expect(opened).toBeGreaterThanOrEqual(0);
    expect(opened).toBeLessThanOrEqual(1);
    const shown = readingsOf(run, panelId);
    expect(shown.length).toBeGreaterThan(0);
    for (const { reading } of shown) {
      expect(reading.opacity).toBe(1);
      expect(reading.scale).toBe(1);
      expect(reading.width).toBe(600);
    }
  });

  test("search results change in the frame the query does, and the suggestions come back in one frame when it's cleared", async ({
    page,
  }) => {
    await openDemo(page, "/orders");
    await page.keyboard.press("/");
    await page.waitForTimeout(400);
    const rows = '.bt-command-search-panel [role="option"]';
    const settledWithin = (frames: Run["frames"]): number => {
      const counts = frames.map(({ elements }) => elements.length);
      const last = counts.at(-1);
      return counts.findIndex(
        (count, index) =>
          count === last &&
          counts.slice(index).every((later) => later === last),
      );
    };
    await startSampling(page, rows, ["keydown"]);
    await page.keyboard.type("r");
    const typed = framesFrom(await finishSampling(page, 200), "keydown");
    const swapped = settledWithin(typed);
    report(`search: results swap in ${String(swapped)} frames after the key`);
    expect(swapped).toBeLessThanOrEqual(1);
    expect(typed.at(-1)?.elements.length ?? 0).toBeGreaterThan(3);
    await startSampling(page, rows, ["keydown"]);
    await page.keyboard.press("Escape");
    const cleared = framesFrom(await finishSampling(page, 200), "keydown");
    const back = settledWithin(cleared);
    report(`search: suggestions back ${String(back)} frames after clearing`);
    expect(back).toBeLessThanOrEqual(1);
    expect(cleared.at(-1)?.elements.length).toBe(3);
  });

  test("a remote group keeps its rows while it asks again, with a spinner row in itself alone", async ({
    page,
  }) => {
    await openDemo(page, "/orders");
    await page.keyboard.press("/");
    await page.keyboard.type("pay");
    const help = page.getByRole("group", { name: "Help" });
    await expect(
      help.locator('[role="option"]:not([aria-disabled])').first(),
    ).toBeVisible();
    const rows =
      '.bt-command-search-panel [role="group"][aria-label="Help"] [role="option"]';
    const before = await page.locator(rows).count();
    await startSampling(page, rows, ["keydown"]);
    await page.keyboard.type("o");
    const spinners = await page.locator('[data-bt-part="searching"]').count();
    const spinnersInHelp = await help
      .locator('[data-bt-part="searching"]')
      .count();
    const run = framesFrom(await finishSampling(page, 800), "keydown");
    expect(spinners).toBe(1);
    expect(spinnersInHelp).toBe(1);
    for (const { elements } of run) expect(elements.length).toBeGreaterThan(0);
    expect(run.some(({ elements }) => elements.length === before + 1)).toBe(
      true,
    );
    await expect(page.locator('[data-bt-part="searching"]')).toHaveCount(0);
  });

  test("a row's hover actions fade in over dur-fast while its tint shows at once", async ({
    page,
  }) => {
    await page.goto("/components/hover-actions?motion=full");
    await page.locator("h1").first().waitFor();
    const row = page.locator('[data-bt="HoverActions"]').first();
    await row.scrollIntoViewIfNeeded();
    await row.evaluate((element) => {
      element.setAttribute("data-sample", "");
    });
    await startSampling(
      page,
      '[data-sample], [data-sample] > [data-bt-part="actions"]',
    );
    await row.hover();
    const run = await finishSampling(page, 300);
    expect(transitionsOf(run, "opacity")).toContainEqual([
      DURATIONS.fast,
      CSS_EASE_OUT,
    ]);
    expect(transitionsOf(run, "background-color")).toEqual([]);
  });
});

test.describe("Accordion on its docs page (MOTION_SPEC §3)", () => {
  test.beforeEach(async ({ page }) => {
    await installSampler(page);
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  /**
   * Opens the Accordion page and marks the live demo's item `name` for sampling: its panel's `Morph`, the
   * content inside it and its chevron. The demo opens one item at a time and starts with its first open.
   */
  async function markItem(
    page: Page,
    motion: "full" | "reduced",
    name: string,
  ): Promise<Locator> {
    await page.goto(`/components/accordion?chrome=0&motion=${motion}`);
    await page.getByRole("heading", { level: 1 }).waitFor();
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    const demo = page.getByTestId("live-demo");
    await demo.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const trigger = demo.getByRole("button", { name, exact: true });
    await trigger.evaluate((element) => {
      const item = element.closest('[data-bt-part="accordion-item"]');
      item
        ?.querySelector('[data-bt="Morph"]')
        ?.setAttribute("data-sampled-panel", "");
      item
        ?.querySelector('[data-bt-part="accordion-chevron"]')
        ?.setAttribute("data-sampled-chevron", "");
    });
    return trigger;
  }

  const PANEL = "[data-sampled-panel]";
  const VIEW = `${PANEL} > [data-bt-part="content"] > [data-bt-part="view"]`;
  const CHEVRON = "[data-sampled-chevron]";

  /** How far the chevron has turned, from 0 (pointing down) to 1 (turned over), read from its transform. */
  function turn(reading: Reading): number {
    return Math.acos(Math.max(-1, Math.min(1, reading.scale))) / Math.PI;
  }

  test("an item opens on spring.smooth while its chevron turns over with it and its answer fades in over dur-fast", async ({
    page,
  }) => {
    const trigger = await markItem(page, "full", "How much is shipping?");
    const run = await sampleClickOn(
      page,
      trigger,
      `${CHEVRON}, ${PANEL}, ${VIEW}`,
      700,
    );
    const [chevron, panel] = run.before.elements.map((reading) => reading.id);
    if (chevron === undefined || panel === undefined)
      throw new Error("The item's chevron and panel weren't there.");
    const heights = traceOf(run, panel, (reading) => reading.height);
    const open = heights.at(-1)?.value ?? 0;
    expect(open).toBeGreaterThan(30);
    const height = expectSpring(
      "accordion opening",
      progress(heights, 0, open),
      "smooth",
    );
    const turning = expectSpringCurve(
      "accordion chevron turning over",
      progress(traceOf(run, chevron, turn), 0, 1),
      "smooth",
    );
    expect(Math.abs(turning.start - height.start)).toBeLessThanOrEqual(FRAME);
    const view = elementIds(run).find(
      (id) =>
        id !== chevron && id !== panel && id !== run.before.elements[2]?.id,
    );
    if (view === undefined) throw new Error("The answer never showed.");
    expectTween(
      "accordion answer fading in",
      progress(traceOf(run, view, opacity), 0, 1),
      EASE_STANDARD,
      DURATIONS.fast,
    );
  });

  test("an item closes on spring.smooth, its answer fading out over dur-fast, faster than the height", async ({
    page,
  }) => {
    const trigger = await markItem(page, "full", "When will my coffee arrive?");
    const run = await sampleClickOn(
      page,
      trigger,
      `${CHEVRON}, ${PANEL}, ${VIEW}`,
      700,
    );
    const [chevron, panel, view] = run.before.elements.map(
      (reading) => reading.id,
    );
    if (chevron === undefined || panel === undefined || view === undefined)
      throw new Error(
        "The open item's chevron, panel and answer weren't there.",
      );
    const heights = traceOf(run, panel, (reading) => reading.height);
    const open = run.before.elements[1]?.height ?? 0;
    expect(open).toBeGreaterThan(30);
    expect(heights.at(-1)?.value).toBe(0);
    const height = expectSpring(
      "accordion closing",
      progress(heights, open, 0),
      "smooth",
    );
    expectSpringCurve(
      "accordion chevron turning back",
      progress(traceOf(run, chevron, turn), 1, 0),
      "smooth",
    );
    const fading = expectTween(
      "accordion answer fading out",
      progress(traceOf(run, view, opacity), 1, 0),
      EASE_STANDARD,
      DURATIONS.fast,
    );
    const due = height.start + springSettle(SPRINGS.smooth);
    report(
      `accordion closing: the answer has faded ${ms(due - (fading.start + DURATIONS.fast))} before the height is 95% closed`,
    );
    expect(fading.start + DURATIONS.fast).toBeLessThan(due);
    expectGoneSoonAfter(run, fading.start + DURATIONS.fast, view);
  });

  test("with reduced motion an item opens at once, its chevron turned over at once and its answer faded in over 100ms", async ({
    page,
  }) => {
    const trigger = await markItem(page, "reduced", "How much is shipping?");
    const run = await sampleClickOn(
      page,
      trigger,
      `${CHEVRON}, ${PANEL}, ${VIEW}`,
      400,
    );
    const [chevron, panel, closed] = run.before.elements.map(
      (reading) => reading.id,
    );
    if (chevron === undefined || panel === undefined)
      throw new Error("The item's chevron and panel weren't there.");
    const heights = traceOf(run, panel, (reading) => reading.height);
    const open = heights.at(-1)?.value ?? 0;
    expect(open).toBeGreaterThan(30);
    expectInstant(progress(heights, 0, open));
    expectInstant(progress(traceOf(run, chevron, turn), 0, 1));
    const view = elementIds(run).find(
      (id) => id !== chevron && id !== panel && id !== closed,
    );
    if (view === undefined) throw new Error("The answer never showed.");
    expectTween(
      "accordion answer fading in",
      progress(traceOf(run, view, opacity), 0, 1),
      LINEAR,
      DURATIONS.reduced,
    );
  });
});

test.describe("Bento's variants on the marketing page", () => {
  /** Marks the visual of the plain card in the variants demo for the sampler, and returns where to hover. */
  async function plainVisual(
    page: Page,
    motion: "full" | "reduced",
  ): Promise<{ readonly x: number; readonly y: number }> {
    await installSampler(page);
    await page.goto(`/patterns/marketing-page?chrome=0&motion=${motion}`);
    const card = page.getByRole("article", {
      name: "Present from any screen",
    });
    await card.evaluate((element) => {
      element
        .querySelector(':scope > [data-bt-part="visual"]')
        ?.setAttribute("data-testid", "plain-visual");
    });
    return centerOf(card.locator(':scope > [data-bt-part="visual"]'));
  }

  test("hovering a plain card lifts its visual 2px over dur-fast, raising its shadow", async ({
    page,
  }) => {
    const { x, y } = await plainVisual(page, "full");
    await startSampling(page, testId("plain-visual"));
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
    expectTween("plain card's visual lift", lift, EASE_OUT, DURATIONS.fast);
    expect(lift.at(-1)?.value).toBe(1);
  });

  test("with reduced motion a plain card's visual doesn't lift on hover", async ({
    page,
  }) => {
    const { x, y } = await plainVisual(page, "reduced");
    await startSampling(page, testId("plain-visual"));
    await page.mouse.move(x, y);
    const hovered = await finishSampling(page, 300);
    expectAtRest(hovered);
  });
});
