import { AnimatePresence, motion } from "motion/react";
import type { Transition } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { useMotionPreference } from "../../motion/preference.ts";
import type { MotionElementProps } from "../../motion/props.ts";
import {
  reducedTransition,
  useButteryTransition,
} from "../../motion/transitions.ts";
import { useAnimationTracking } from "../../motion/use-animation-tracking.ts";
import { durations, easingCurves, spring } from "../../tokens/motion.ts";
import { cx } from "../../utils/cx.ts";
import { useMergedRefs } from "../../utils/merge-refs.ts";

const crossfade: Transition = {
  duration: durations.fast / 1000,
  ease: easingCurves.standard,
};

interface MorphHeight {
  readonly height: number;
  readonly animate: boolean;
}

function MorphView({
  reduced,
  children,
}: {
  readonly reduced: boolean;
  readonly children: ReactNode;
}): ReactElement {
  const tracking = useAnimationTracking();
  const transition = reduced ? reducedTransition : crossfade;
  return (
    <motion.div
      {...tracking}
      data-bt-part="view"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition }}
      exit={{ opacity: 0, transition }}
    >
      {children}
    </motion.div>
  );
}

/** Props for `Morph`. */
export interface MorphProps extends MotionElementProps<"div"> {
  /**
   * Identifies the content, such as the selected tab. Changing it crossfades the old content out and the
   * new content in while the height follows.
   */
  readonly contentKey?: string | number | undefined;
}

/**
 * One container whose content can swap or grow: its height follows the content with `spring.smooth` and
 * swapped content crossfades in place. Resizing the window changes the height at once. With reduced motion
 * the height jumps and the crossfade takes 100ms.
 *
 * @example
 * <Morph contentKey={fill}>
 *   {fill === "gradient" ? <GradientSwatches /> : <SolidSwatches />}
 * </Morph>
 */
export function Morph({
  contentKey,
  className,
  ref,
  children,
  ...rest
}: MorphProps): ReactElement {
  const reduced = useMotionPreference() === "reduced";
  const transition = useButteryTransition("smooth");
  const tracking = useAnimationTracking();
  const outer = useRef<HTMLDivElement>(null);
  const merged = useMergedRefs(ref, outer);
  const content = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<MorphHeight | null>(null);

  useLayoutEffect(() => {
    const element = content.current;
    if (!element) return undefined;
    let width = element.getBoundingClientRect().width;
    const observer = new ResizeObserver(([entry]) => {
      const box = entry?.borderBoxSize[0];
      if (!box) return;
      const resized = Math.abs(box.inlineSize - width) > 0.5;
      width = box.inlineSize;
      setSize((current) =>
        current?.height === box.blockSize
          ? current
          : { height: box.blockSize, animate: current !== null && !resized },
      );
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <motion.div
      {...rest}
      ref={merged}
      className={cx("bt-morph", className)}
      data-bt="Morph"
      initial={false}
      animate={size ? { height: size.height } : {}}
      transition={size?.animate ? transition : spring.instant}
      onAnimationStart={() => {
        outer.current?.setAttribute("data-animating", "");
        tracking.onAnimationStart();
      }}
      onAnimationComplete={() => {
        outer.current?.removeAttribute("data-animating");
        tracking.onAnimationComplete();
      }}
    >
      <div ref={content} data-bt-part="content">
        <AnimatePresence initial={false} mode="popLayout">
          <MorphView key={contentKey ?? "content"} reduced={reduced}>
            {children}
          </MorphView>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
