import { useEffect, useRef, useState } from "react";
import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";
import { useMotionPreference } from "../../motion/preference.ts";
import { AnimationTrackingContext } from "../../motion/use-animation-tracking.ts";
import { timing } from "../../tokens/motion.ts";
import { cx } from "../../utils/cx.ts";
import { warnOnce } from "../../utils/dev.ts";
import { useMergedRefs } from "../../utils/merge-refs.ts";

const SHORTEST = 3000;
const LONGEST = 5000;

/** Props for `Loop`. */
export interface LoopProps extends Omit<
  ComponentPropsWithRef<"div">,
  "children"
> {
  /** How many steps the demo cycles through. */
  readonly steps: number;
  /** Time on each step in milliseconds. Defaults to `--bt-loop-cycle` (4000); keep it between 3000 and 5000. */
  readonly interval?: number | undefined;
  /**
   * Holds the current step. Pair it with a pause button when a loop runs beside content people read, so
   * they can stop it (WCAG 2.2.2).
   */
  readonly paused?: boolean | undefined;
  /** Renders the demo at a step, from 0 to `steps - 1`. */
  readonly children: (step: number) => ReactNode;
}

/**
 * Cycles a living demo through its steps, such as a chart extending or a row appearing. It pauses while
 * it's off screen, while the page is hidden, while the pointer is over it or focus is inside it, and when
 * `paused` is set; it stays on the first step with reduced motion, and its animations don't hold buttery's
 * settled flag. Never loop something the user is editing.
 *
 * @example
 * <Loop steps={3}>
 *   {(step) => <Chart points={series[step]} />}
 * </Loop>
 */
export function Loop({
  steps,
  interval = timing["loop-cycle"],
  paused = false,
  className,
  ref,
  children,
  ...rest
}: LoopProps): ReactElement {
  const reduced = useMotionPreference() === "reduced";
  const [step, setStep] = useState(0);
  const element = useRef<HTMLDivElement>(null);
  const merged = useMergedRefs(ref, element);

  useEffect(() => {
    if (interval >= SHORTEST && interval <= LONGEST) return;
    warnOnce(
      "Loop",
      `interval={${String(interval)}} steps too quickly or too slowly for a living demo. Fix: keep it between ${String(SHORTEST)} and ${String(LONGEST)}, or leave it out for --bt-loop-cycle.`,
    );
  }, [interval]);

  useEffect(() => {
    const node = element.current;
    if (!node || reduced || paused || steps < 2) return undefined;
    let timer = 0;
    let onScreen = false;
    let pointer = node.matches(":hover");
    let focus = node.contains(document.activeElement);
    const update = (): void => {
      const run =
        onScreen && !pointer && !focus && document.visibilityState !== "hidden";
      if (run && timer === 0) {
        timer = window.setInterval(() => {
          setStep((current) => (current + 1) % steps);
        }, interval);
      } else if (!run && timer !== 0) {
        window.clearInterval(timer);
        timer = 0;
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry?.isIntersecting ?? false;
      update();
    });
    const enter = (): void => {
      pointer = true;
      update();
    };
    const leave = (): void => {
      pointer = false;
      update();
    };
    const focusIn = (): void => {
      focus = true;
      update();
    };
    const focusOut = (event: FocusEvent): void => {
      focus =
        event.relatedTarget instanceof Node &&
        node.contains(event.relatedTarget);
      update();
    };
    observer.observe(node);
    node.addEventListener("pointerenter", enter);
    node.addEventListener("pointerleave", leave);
    node.addEventListener("focusin", focusIn);
    node.addEventListener("focusout", focusOut);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      node.removeEventListener("pointerenter", enter);
      node.removeEventListener("pointerleave", leave);
      node.removeEventListener("focusin", focusIn);
      node.removeEventListener("focusout", focusOut);
      document.removeEventListener("visibilitychange", update);
      window.clearInterval(timer);
    };
  }, [reduced, paused, steps, interval]);

  const shown = reduced ? 0 : step % Math.max(steps, 1);
  return (
    <AnimationTrackingContext value={false}>
      <div
        {...rest}
        ref={merged}
        className={cx("bt-loop", className)}
        data-bt="Loop"
        data-step={shown}
      >
        {children(shown)}
      </div>
    </AnimationTrackingContext>
  );
}
