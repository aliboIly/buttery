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
// can't reach, so the threshold is checked against visible height instead.
function whenInView(element: HTMLElement, onEnter: () => void): () => void {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (
          entry.isIntersecting &&
          isEnough(
            entry.intersectionRect.height,
            entry.boundingClientRect.height,
            entry.rootBounds?.height ?? window.innerHeight,
          )
        ) {
          observer.disconnect();
          onEnter();
          return;
        }
      }
    },
    { threshold: THRESHOLDS },
  );
  observer.observe(element);
  return () => {
    observer.disconnect();
  };
}

/**
 * Runs the scroll-in entrance on `targets` the first time `trigger` is 15% in view (15% of the viewport for
 * content taller than it), and reports it to the settled flag when `tracked`. Content already in view on the
 * first frame gets one 200ms fade instead, so nothing the user is looking at rises into place. `onShown`
 * runs once the targets have arrived, including when a cleanup finishes an entrance early; a cleanup before
 * the entrance starts only shows the targets again. Returns the cleanup.
 */
export function revealOnce(
  trigger: HTMLElement,
  targets: readonly HTMLElement[],
  {
    tracked,
    stepped,
    onShown,
  }: {
    readonly tracked: boolean;
    readonly stepped: boolean;
    readonly onShown?: (() => void) | undefined;
  },
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
    if (running) {
      running.complete();
      onShown?.();
    }
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
