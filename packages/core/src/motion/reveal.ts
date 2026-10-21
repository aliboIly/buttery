import { animate, stagger } from "motion";
import type { DOMKeyframesDefinition } from "motion";
import { spring, timing, travel } from "../tokens/motion.ts";
import { trackAnimation } from "./settle.ts";
import { fadeIn } from "./transitions.ts";

const HIDDEN_TRANSFORM = `translateY(${String(travel.reveal)}px)`;
const SHOWN_TRANSFORM = "translateY(0px)";
const AMOUNT = 0.15;
const LONGEST_ENTRANCE = timing["entrance-max"] / 1000;

const arrive: DOMKeyframesDefinition = {
  opacity: [0, 1],
  transform: [HIDDEN_TRANSFORM, SHOWN_TRANSFORM],
};

const arriveOptions = {
  default: spring.gentle,
  opacity: fadeIn,
};

interface InlineStyle {
  readonly opacity: string;
  readonly transform: string;
}

const owners = new WeakMap<HTMLElement, symbol>();
const THRESHOLDS = Array.from({ length: 101 }, (_, step) => step / 100);

/** Whether `visible` px of an element `height` px tall is enough: 15% of it, or of the viewport if it's taller. */
function isEnough(visible: number, height: number, viewport: number): boolean {
  return visible > 0 && visible >= Math.min(height, viewport) * AMOUNT;
}

function isInView(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  const visible =
    Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
  return (
    isEnough(visible, rect.height, window.innerHeight) &&
    rect.right > 0 &&
    rect.left < window.innerWidth
  );
}

// IntersectionObserver's ratio is a share of the element's area, which an element taller than the viewport
// can't reach, so the threshold is checked against visible height instead. Ratios arrive in 1% steps, too far
// apart for content many screens tall, so a second observer with the viewport's outer 15% cut off catches
// that as soon as it reaches the middle.
function whenInView(element: HTMLElement, onEnter: () => void): () => void {
  const enough = new IntersectionObserver(
    (entries) => {
      const entered = entries.some(
        (entry) =>
          entry.isIntersecting &&
          isEnough(
            entry.intersectionRect.height,
            entry.boundingClientRect.height,
            entry.rootBounds?.height ?? window.innerHeight,
          ),
      );
      if (entered) enter();
    },
    { threshold: THRESHOLDS },
  );
  const middle = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) enter();
    },
    { rootMargin: `-${String(AMOUNT * 100)}% 0px` },
  );
  let entered = false;
  const stop = (): void => {
    enough.disconnect();
    middle.disconnect();
  };
  function enter(): void {
    if (entered) return;
    entered = true;
    stop();
    onEnter();
  }
  enough.observe(element);
  middle.observe(element);
  return stop;
}

/** Options for `revealOnce`. */
export interface RevealOnceOptions {
  /** Whether the entrance reports to the settled flag, as `useAnimationTracking` says. */
  readonly tracked: boolean;
  /**
   * Whether the targets arrive one after another, `--bt-stagger` apart, as a list's items do. A stepped
   * entrance plays even when it starts in view, where an unstepped one only fades in.
   */
  readonly stepped: boolean;
  /** Runs once the targets have arrived. */
  readonly onShown?: (() => void) | undefined;
}

/**
 * Runs the scroll-in entrance on `targets` the first time `trigger` is 15% in view (15% of the viewport for
 * content taller than it), and reports it to the settled flag when `tracked`. Content already in view on the
 * first frame gets one 200ms fade instead, so nothing the user is looking at rises into place. `onShown`
 * runs once the targets have arrived. A cleanup finishes a running entrance at once but reports it a
 * microtask later, so an effect that runs again straight away (Strict Mode, a new motion setting) still
 * decides for itself whether to play; a cleanup before the entrance starts only shows the targets again.
 * Returns the cleanup.
 */
export function revealOnce(
  trigger: HTMLElement,
  targets: readonly HTMLElement[],
  { tracked, stepped, onShown }: RevealOnceOptions,
): () => void {
  let release: (() => void) | null = null;
  let running: { complete: () => void } | null = null;
  const owner = Symbol("reveal");
  const inline = new Map<HTMLElement, InlineStyle>();
  for (const target of targets) {
    owners.set(target, owner);
    inline.set(target, {
      opacity: target.style.opacity,
      transform: target.style.transform,
    });
  }
  const restore = (): void => {
    for (const target of targets) {
      if (owners.get(target) !== owner) continue;
      const saved = inline.get(target);
      target.style.opacity = saved?.opacity ?? "";
      target.style.transform = saved?.transform ?? "";
    }
  };
  // Motion writes each animation's last frame inline as it finishes, sometimes after this has run.
  const clear = (): void => {
    restore();
    requestAnimationFrame(restore);
  };

  const play = (keyframes: DOMKeyframesDefinition, delayEach: number): void => {
    release = tracked ? trackAnimation() : null;
    const controls = animate([...targets], keyframes, {
      ...arriveOptions,
      ...(delayEach > 0 ? { delay: stagger(delayEach) } : {}),
    });
    running = controls;
    void controls.finished.then(() => {
      clear();
      release?.();
      release = null;
      onShown?.();
    });
  };

  // Stopping would leave Motion to write the half-way value after the cleanup, so cleanups finish instead.
  const finish = (): void => {
    running?.complete();
    clear();
    release?.();
  };

  if (!stepped && isInView(trigger)) {
    play({ opacity: [0, 1] }, 0);
    return finish;
  }

  // Waiting targets are only transparent: an offset would push them past their container until they arrive.
  for (const target of targets) target.style.opacity = "0";
  const settle = spring.gentle.visualDuration;
  const delayEach =
    stepped && targets.length > 1
      ? Math.min(
          timing.stagger / 1000,
          (LONGEST_ENTRANCE - settle) / (targets.length - 1),
        )
      : 0;
  const stop = whenInView(trigger, () => {
    play(arrive, delayEach);
  });
  return () => {
    stop();
    finish();
  };
}
