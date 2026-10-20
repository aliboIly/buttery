import type { Page } from "@playwright/test";

/** What the sampler reads from one element in one frame. */
export interface Reading {
  /** Identifies the element across frames. */
  readonly id: number;
  /** Its box as drawn, transforms included, in viewport px. */
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
  readonly opacity: number;
  /** Its translation from `transform` and `translate`, in px. */
  readonly x: number;
  readonly y: number;
  /** Its scale from `transform` and `scale`. */
  readonly scale: number;
}

/**
 * The sampled elements in one animation frame, read as the frame begins: before the browser's own layout
 * pass, so a size that a ResizeObserver puts back before paint can show for that one frame.
 */
export interface Frame {
  /** When the frame started, in ms since sampling began. */
  readonly t: number;
  /** Whether buttery's settled flag was up. */
  readonly settled: boolean;
  /** Every element matching the selector, in document order. */
  readonly elements: readonly Reading[];
}

/** A CSS transition that started running on a sampled element. */
export interface TransitionRecord {
  /** The element it ran on, as in its readings. */
  readonly id: number;
  /** When it started running, in ms since sampling began. */
  readonly t: number;
  readonly property: string;
  /** In ms. */
  readonly duration: number;
  readonly easing: string;
}

/** The elements just before the action, then on every frame after it, and when marked events happened. */
export interface Run {
  readonly before: Frame;
  readonly frames: readonly Frame[];
  /** The first time each marked event happened, in ms since sampling began. */
  readonly marks: Readonly<Partial<Record<string, number>>>;
  /** The CSS transitions that ran on the sampled elements. */
  readonly transitions: readonly TransitionRecord[];
}

interface Sampler {
  readonly start: (selector: string, events: readonly string[]) => void;
  readonly mark: (name: string) => void;
  readonly peek: (selector: string) => Reading | undefined;
  readonly stop: () => Run;
}

declare global {
  interface Window {
    motionSampler?: Sampler;
  }
}

// addInitScript serializes this function into the page, so it can't use anything else in this module.
function samplerScript(startOnLoad: string | undefined): void {
  const ids = new WeakMap<Element, number>();
  let nextId = 1;
  let active: {
    readonly selector: string;
    readonly origin: number;
    readonly before: Frame;
    readonly frames: Frame[];
    readonly marks: Record<string, number>;
    readonly transitions: TransitionRecord[];
    readonly unlisten: () => void;
    request: number;
  } | null = null;

  const idOf = (element: Element): number => {
    const known = ids.get(element);
    if (known !== undefined) return known;
    const id = nextId;
    nextId += 1;
    ids.set(element, id);
    return id;
  };

  const read = (element: Element): Reading => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    const matrix = new DOMMatrixReadOnly(style.transform);
    const [translateX = 0, translateY = 0] = style.translate
      .split(" ")
      .map((part) => Number.parseFloat(part) || 0);
    const scaleX = Number.parseFloat(style.scale);
    const scale = Number.isNaN(scaleX) ? 1 : scaleX;
    return {
      id: idOf(element),
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      opacity: Number(style.opacity),
      x: matrix.m41 + translateX,
      y: matrix.m42 + translateY,
      scale: matrix.a * scale,
    };
  };

  const frame = (selector: string, t: number): Frame => ({
    t,
    settled: document.documentElement.hasAttribute("data-bt-settled"),
    elements: [...document.querySelectorAll(selector)].map(read),
  });

  const tick = (now: number): void => {
    if (!active) return;
    active.frames.push(frame(active.selector, now - active.origin));
    active.request = requestAnimationFrame(tick);
  };

  const mark = (name: string): void => {
    if (active) active.marks[name] ??= performance.now() - active.origin;
  };

  window.motionSampler = {
    start(selector, events) {
      if (active) throw new Error("The sampler is already running.");
      const origin = performance.now();
      const transitions: TransitionRecord[] = [];
      const onTransition = (event: TransitionEvent): void => {
        const { target, propertyName } = event;
        if (!(target instanceof Element) || !target.matches(selector)) return;
        const running = target
          .getAnimations()
          .find(
            (animation) =>
              animation instanceof CSSTransition &&
              animation.transitionProperty === propertyName,
          );
        const timing = running?.effect?.getComputedTiming();
        transitions.push({
          id: idOf(target),
          t: performance.now() - origin,
          property: propertyName,
          duration:
            typeof timing?.duration === "number" ? timing.duration : Number.NaN,
          easing: running?.effect?.getTiming().easing ?? "",
        });
      };
      const listeners = events.map((name) => {
        const listener = (): void => {
          mark(name);
        };
        window.addEventListener(name, listener, true);
        return () => {
          window.removeEventListener(name, listener, true);
        };
      });
      window.addEventListener("transitionrun", onTransition, true);
      active = {
        selector,
        origin,
        before: frame(selector, 0),
        frames: [],
        marks: {},
        transitions,
        unlisten: () => {
          for (const unlisten of listeners) unlisten();
          window.removeEventListener("transitionrun", onTransition, true);
        },
        request: requestAnimationFrame(tick),
      };
    },
    mark,
    peek(selector) {
      const element = document.querySelector(selector);
      return element ? read(element) : undefined;
    },
    stop() {
      if (!active) throw new Error("The sampler isn't running.");
      const { before, frames, marks, transitions, request, unlisten } = active;
      cancelAnimationFrame(request);
      unlisten();
      active = null;
      return { before, frames, marks, transitions };
    },
  };

  if (startOnLoad !== undefined) {
    document.addEventListener(
      "DOMContentLoaded",
      () => {
        window.motionSampler?.start(startOnLoad, []);
      },
      { once: true },
    );
  }
}

/**
 * Puts the sampler in every page the test opens; call it before `page.goto`. With `startOnLoad`, it starts
 * reading those elements as the document loads, before the app first renders.
 */
export async function installSampler(
  page: Page,
  startOnLoad?: string,
): Promise<void> {
  await page.addInitScript(samplerScript, startOnLoad);
}

/** Starts reading every element matching `selector` on each frame, and marks the first of each of `events`. */
export async function startSampling(
  page: Page,
  selector: string,
  events: readonly string[] = [],
): Promise<void> {
  await page.evaluate(
    (options) => {
      if (!window.motionSampler) throw new Error("Call installSampler first.");
      window.motionSampler.start(options.selector, options.events);
    },
    { selector, events },
  );
}

/** A value the sampler reads, for waiting on. */
export type Channel = "left" | "height" | "opacity" | "y" | "scale";

/**
 * Waits until the first element matching `selector` has been `by` away from `from` in `channel` for two
 * frames running: one frame can show a size a ResizeObserver puts back before paint (see `Frame`).
 */
export async function waitUntilMoved(
  page: Page,
  selector: string,
  channel: Channel,
  from: number,
  by: number,
): Promise<void> {
  await page.evaluate(
    (options) =>
      new Promise<void>((resolve) => {
        let away = 0;
        const tick = (): void => {
          const reading = window.motionSampler?.peek(options.selector);
          const moved =
            reading !== undefined &&
            Math.abs(reading[options.channel] - options.from) >= options.by;
          away = moved ? away + 1 : 0;
          if (away >= 2) resolve();
          else requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
    { selector, channel, from, by },
  );
}

/** What the first element matching `selector` reads as now. */
export async function peek(
  page: Page,
  selector: string,
): Promise<Reading | undefined> {
  return page.evaluate(
    (target) => window.motionSampler?.peek(target),
    selector,
  );
}

/** Marks now as `name` in the running sample. */
export async function markSample(page: Page, name: string): Promise<void> {
  await page.evaluate((mark) => {
    window.motionSampler?.mark(mark);
  }, name);
}

/** Keeps reading for `duration` ms, then stops and returns the run. */
export async function finishSampling(
  page: Page,
  duration: number,
): Promise<Run> {
  return page.evaluate(async (wait) => {
    if (!window.motionSampler) throw new Error("Call installSampler first.");
    const sampler = window.motionSampler;
    await new Promise((resolve) => setTimeout(resolve, wait));
    return sampler.stop();
  }, duration);
}

/** Clicks `trigger` from inside the page, then reads `selector` on every frame for `duration` ms. */
export async function sampleClick(
  page: Page,
  trigger: string,
  selector: string,
  duration: number,
): Promise<Run> {
  return page.evaluate(
    async (options) => {
      if (!window.motionSampler) throw new Error("Call installSampler first.");
      const sampler = window.motionSampler;
      const button = document.querySelector<HTMLElement>(options.trigger);
      if (!button) throw new Error(`Nothing matches ${options.trigger}`);
      sampler.start(options.selector, []);
      button.click();
      await new Promise((resolve) => setTimeout(resolve, options.duration));
      return sampler.stop();
    },
    { trigger, selector, duration },
  );
}

/** A value at a moment, in ms since sampling began. */
export interface Point {
  readonly t: number;
  readonly value: number;
}

/** Element `id`'s reading in each frame that has it. */
export function readingsOf(
  run: Run,
  id: number,
): readonly { readonly t: number; readonly reading: Reading }[] {
  return run.frames.flatMap(({ t, elements }) => {
    const reading = elements.find((element) => element.id === id);
    return reading ? [{ t, reading }] : [];
  });
}

/** `pick` of the first matching element in each frame that has one. */
export function trace(
  run: Run,
  pick: (reading: Reading) => number,
): readonly Point[] {
  return run.frames.flatMap(({ t, elements }) => {
    const first = elements[0];
    return first ? [{ t, value: pick(first) }] : [];
  });
}

/** `pick` of element `id` in each frame that has it. */
export function traceOf(
  run: Run,
  id: number,
  pick: (reading: Reading) => number,
): readonly Point[] {
  return readingsOf(run, id).map(({ t, reading }) => ({
    t,
    value: pick(reading),
  }));
}

/** The first frame in which buttery's settled flag was up for good, in ms since sampling began. */
export function settledAt(run: Run): number {
  const busy = run.frames.findLastIndex((frame) => !frame.settled);
  const settled = run.frames[busy + 1];
  if (busy === -1 || !settled) {
    throw new Error("Nothing animated, or it never finished.");
  }
  return settled.t;
}

/** The first frame without element `id`, or without any element, after it had been there. */
export function goneAt(run: Run, id?: number): number {
  const present = (frame: Frame): boolean =>
    id === undefined
      ? frame.elements.length > 0
      : frame.elements.some((element) => element.id === id);
  const shown = run.frames.findIndex(present);
  const gone = run.frames.find(
    (frame, index) => index > shown && !present(frame),
  );
  if (shown === -1 || !gone) throw new Error("It never left.");
  return gone.t;
}

/** Every element seen during the run, in the order they first showed up. */
export function elementIds(run: Run): readonly number[] {
  const ids = new Set<number>();
  for (const { elements } of [run.before, ...run.frames]) {
    for (const { id } of elements) ids.add(id);
  }
  return [...ids];
}

/** Each point's share of the way from `from` to `to`. */
export function progress(
  points: readonly Point[],
  from: number,
  to: number,
): readonly Point[] {
  if (!(Math.abs(to - from) > 1e-6)) {
    const values = points.map(
      ({ t, value }) => `${t.toFixed(0)}ms ${String(value)}`,
    );
    throw new Error(`Nothing moved from ${String(from)}: ${values.join(", ")}`);
  }
  return points.map(({ t, value }) => ({
    t,
    value: (value - from) / (to - from),
  }));
}

/** When the progress reached 95% for good, in ms since sampling began. */
export function settleTime(points: readonly Point[]): number {
  let settled = points.at(-1)?.t ?? Number.NaN;
  for (let index = points.length - 1; index >= 0; index -= 1) {
    const point = points[index];
    if (!point || point.value < 0.95) break;
    settled = point.t;
  }
  return settled;
}

/** How far the progress went past the end, as a share of the travel. */
export function overshoot(points: readonly Point[]): number {
  return Math.max(...points.map(({ value }) => value)) - 1;
}

/** How many frames caught the progress between 5% and 95%. */
export function framesBetween(points: readonly Point[]): number {
  return points.filter(({ value }) => value > 0.05 && value < 0.95).length;
}

/** A spring token as MOTION_SPEC §2 defines it: `visualDuration` in seconds. */
export interface SpringSpec {
  readonly visualDuration: number;
  readonly bounce: number;
}

/** A cubic-bezier curve's control points, as CSS and Motion take them. */
export type Curve = readonly [number, number, number, number];

/** How well a curve fits the sampled progress. */
export interface Fit {
  /** When the curve started, in ms since sampling began. */
  readonly start: number;
  /** How far the frames strayed from the fitted curve, as root mean square in ms. */
  readonly error: number;
  /** How many frames the fit used. */
  readonly frames: number;
}

/** A spring fitted to sampled progress. */
export interface SpringFit extends Fit {
  /** The spring's visual duration in seconds. */
  readonly visualDuration: number;
}

/** A tween fitted to sampled progress. */
export interface TweenFit extends Fit {
  /** How long it ran, in ms. */
  readonly duration: number;
}

const SEARCH_STEPS = 60;

/** The input where increasing `curve` reaches `target`, between `low` and `high`. */
function solve(
  curve: (input: number) => number,
  target: number,
  low: number,
  high: number,
): number {
  let below = low;
  let above = high;
  for (let step = 0; step < SEARCH_STEPS; step += 1) {
    const middle = (below + above) / 2;
    if (curve(middle) < target) below = middle;
    else above = middle;
  }
  return (below + above) / 2;
}

/** Motion's damping ratio for a bounce of 0 or more. */
function dampingRatio(bounce: number): number {
  return Math.max(1 - bounce, 0.05);
}

/** A spring released from rest, `phase` radians of its undamped frequency in, as a share of its travel. */
function springProgress(phase: number, ratio: number): number {
  if (ratio >= 1) return 1 - (1 + phase) * Math.exp(-phase);
  const damped = Math.sqrt(1 - ratio * ratio);
  return (
    1 -
    Math.exp(-ratio * phase) *
      (Math.cos(damped * phase) + (ratio / damped) * Math.sin(damped * phase))
  );
}

/** The phase at which a spring reaches `share` of its travel, before any overshoot. */
function springPhase(share: number, ratio: number): number {
  const peak = ratio >= 1 ? 40 : Math.PI / Math.sqrt(1 - ratio * ratio);
  return solve((phase) => springProgress(phase, ratio), share, 0, peak);
}

/** Motion's undamped frequency for a time-defined spring, in radians per ms. */
function springFrequency({ visualDuration }: SpringSpec): number {
  return (2 * Math.PI) / (visualDuration * 1.2) / 1000;
}

/** When a spring from rest is 95% of the way there, in ms. */
export function springSettle(spring: SpringSpec): number {
  return (
    springPhase(0.95, dampingRatio(spring.bounce)) / springFrequency(spring)
  );
}

function bezier(first: number, second: number, along: number): number {
  const rest = 1 - along;
  return (
    3 * rest * rest * along * first +
    3 * rest * along * along * second +
    along * along * along
  );
}

/** The share of a tween's duration at which `curve` reaches `share` of its travel. */
function tweenTime(share: number, [x1, y1, x2, y2]: Curve): number {
  const along = solve((input) => bezier(y1, y2, input), share, 0, 1);
  return bezier(x1, x2, along);
}

interface Line {
  readonly slope: number;
  readonly intercept: number;
  readonly error: number;
  readonly count: number;
}

/** Least squares through the points, with the error measured along t. */
function fitLine(points: readonly Point[]): Line {
  const count = points.length;
  if (count < 2) throw new Error(`Only ${String(count)} frames to fit.`);
  const meanT = points.reduce((sum, { t }) => sum + t, 0) / count;
  const meanValue = points.reduce((sum, { value }) => sum + value, 0) / count;
  let spread = 0;
  let covariance = 0;
  for (const { t, value } of points) {
    spread += (t - meanT) ** 2;
    covariance += (t - meanT) * (value - meanValue);
  }
  const slope = covariance / spread;
  const intercept = meanValue - slope * meanT;
  const squares = points.reduce(
    (sum, { t, value }) => sum + ((value - intercept - slope * t) / slope) ** 2,
    0,
  );
  return { slope, intercept, error: Math.sqrt(squares / count), count };
}

/**
 * Fits `spring`'s curve to the frames between 5% and 95% of the travel: each frame's progress becomes the
 * phase the spring would be at, and the phases must line up in time at the spring's frequency.
 */
export function fitSpring(
  points: readonly Point[],
  spring: SpringSpec,
): SpringFit {
  const ratio = dampingRatio(spring.bounce);
  const line = fitLine(
    points
      .filter(({ value }) => value > 0.05 && value < 0.95)
      .map(({ t, value }) => ({ t, value: springPhase(value, ratio) })),
  );
  return {
    visualDuration: (2 * Math.PI) / (1.2 * line.slope * 1000),
    start: -line.intercept / line.slope,
    error: line.error,
    frames: line.count,
  };
}

/**
 * Fits a tween on `curve` to the frames between 2% and 98% of the travel: each frame's progress becomes the
 * share of the duration the curve would be at, and those must line up in time.
 */
export function fitTween(points: readonly Point[], curve: Curve): TweenFit {
  const line = fitLine(
    points
      .filter(({ value }) => value > 0.02 && value < 0.98)
      .map(({ t, value }) => ({ t, value: tweenTime(value, curve) })),
  );
  return {
    duration: 1 / line.slope,
    start: -line.intercept / line.slope,
    error: line.error,
    frames: line.count,
  };
}
