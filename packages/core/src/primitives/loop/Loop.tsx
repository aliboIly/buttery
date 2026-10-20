import { useEffect, useRef, useState } from "react";
import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";
import { useMotionPreference } from "../../motion/preference.ts";
import { AnimationTrackingContext } from "../../motion/use-animation-tracking.ts";
import { timing } from "../../tokens/motion.ts";
import { cx } from "../../utils/cx.ts";
import { useMergedRefs } from "../../utils/merge-refs.ts";

/** Props for `Loop`. */
export interface LoopProps extends Omit<
  ComponentPropsWithRef<"div">,
  "children"
> {
  /** How many steps the demo cycles through. */
  readonly steps: number;
  /** Time on each step in milliseconds. Defaults to `--bt-loop-cycle` (4000); keep it between 3000 and 5000. */
  readonly interval?: number | undefined;
  /** Renders the demo at a step, from 0 to `steps - 1`. */
  readonly children: (step: number) => ReactNode;
}

/**
 * Cycles a living demo through its steps, such as a chart extending or a row appearing. It pauses while
 * it's off screen, stays on the first step with reduced motion, and its animations don't hold buttery's
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
    const node = element.current;
    if (!node || reduced || steps < 2) return undefined;
    let timer = 0;
    const stop = (): void => {
      window.clearInterval(timer);
      timer = 0;
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) {
        stop();
        return;
      }
      if (timer !== 0) return;
      timer = window.setInterval(() => {
        setStep((current) => (current + 1) % steps);
      }, interval);
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
      stop();
    };
  }, [reduced, steps, interval]);

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
