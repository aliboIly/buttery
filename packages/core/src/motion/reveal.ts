import { animate, inView, stagger } from "motion";
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

// Waiting items are only transparent: an offset there would push them past their container until they arrive.
function hide(elements: readonly HTMLElement[]): void {
  for (const element of elements) element.style.setProperty("opacity", "0");
}

function unhide(elements: readonly HTMLElement[]): void {
  for (const element of elements) {
    element.style.removeProperty("opacity");
    element.style.removeProperty("transform");
  }
}

const owners = new WeakMap<HTMLElement, symbol>();

function isInView(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  const visible =
    Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
  return (
    visible > 0 &&
    visible >= Math.min(rect.height, window.innerHeight) * AMOUNT &&
    rect.right > 0 &&
    rect.left < window.innerWidth
  );
}

/**
 * Runs the scroll-in entrance on `targets` the first time `trigger` is 15% in view, and reports it to the
 * settled flag when `tracked`. Content already in view on the first frame gets one 200ms fade instead,
 * so nothing the user is looking at rises into place. Returns the cleanup.
 */
export function revealOnce(
  trigger: HTMLElement,
  targets: readonly HTMLElement[],
  {
    tracked,
    stepped,
  }: { readonly tracked: boolean; readonly stepped: boolean },
): () => void {
  let release: (() => void) | null = null;
  let running: { complete: () => void } | null = null;
  const owner = Symbol("reveal");
  for (const target of targets) owners.set(target, owner);
  const own = (): HTMLElement[] =>
    targets.filter((target) => owners.get(target) === owner);
  // Motion writes each animation's last frame inline as it finishes, sometimes after this has run.
  const clear = (): void => {
    unhide(own());
    requestAnimationFrame(() => {
      unhide(own());
    });
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

  hide(targets);
  const settle = spring.gentle.visualDuration;
  const delayEach =
    stepped && targets.length > 1
      ? Math.min(
          timing.stagger / 1000,
          (LONGEST_ENTRANCE - settle) / (targets.length - 1),
        )
      : 0;
  const stop = inView(
    trigger,
    () => {
      stop();
      play(arrive, delayEach);
    },
    { amount: AMOUNT },
  );
  return () => {
    stop();
    finish();
  };
}
