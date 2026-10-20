import { AnimatePresence, animate, motion, useMotionValue } from "motion/react";
import type { AnimationPlaybackControls, Transition } from "motion/react";
import { useLayoutEffect, useRef } from "react";
import type { ReactElement, ReactNode } from "react";
import { useMotionPreference } from "../../motion/preference.ts";
import type { MotionElementProps } from "../../motion/props.ts";
import {
  reducedTransition,
  useButteryTransition,
} from "../../motion/transitions.ts";
import { useAnimationTracking } from "../../motion/use-animation-tracking.ts";
import { durations, easingCurves } from "../../tokens/motion.ts";
import { cx } from "../../utils/cx.ts";
import { useMergedRefs } from "../../utils/merge-refs.ts";

const crossfade: Transition = {
  duration: durations.fast / 1000,
  ease: easingCurves.standard,
};

interface Busy {
  growing: boolean;
  leaving: boolean;
}

// The content stays clipped while the height moves and until swapped-out content has faded away.
function syncClip(
  element: HTMLElement | null,
  { growing, leaving }: Busy,
): void {
  element?.toggleAttribute("data-animating", growing || leaving);
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
 * swapped content crossfades in place. Between changes it sits at its natural height, so text that
 * rewraps when the window resizes never spills out. With reduced motion the height jumps and the
 * crossfade takes 100ms.
 *
 * @example
 * <Morph contentKey={fill}>
 *   {fill === "gradient" ? <GradientSwatches /> : <SolidSwatches />}
 * </Morph>
 */
export function Morph({
  contentKey,
  className,
  style,
  ref,
  children,
  ...rest
}: MorphProps): ReactElement {
  const reduced = useMotionPreference() === "reduced";
  const transition = useButteryTransition("smooth");
  const tracking = useAnimationTracking();
  const height = useMotionValue<number | string>("auto");
  const outer = useRef<HTMLDivElement>(null);
  const merged = useMergedRefs(ref, outer);
  const content = useRef<HTMLDivElement>(null);
  const busy = useRef<Busy>({ growing: false, leaving: false });
  const shownKey = useRef(contentKey);

  useLayoutEffect(() => {
    if (shownKey.current === contentKey) return;
    shownKey.current = contentKey;
    busy.current.leaving = true;
    syncClip(outer.current, busy.current);
  });

  useLayoutEffect(() => {
    const node = content.current;
    const box = outer.current;
    if (!node || !box) return undefined;
    let { width, height: last } = node.getBoundingClientRect();
    let running: AnimationPlaybackControls | null = null;
    const settle = (): void => {
      running = null;
      height.set("auto");
      busy.current.growing = false;
      syncClip(box, busy.current);
      tracking.onAnimationComplete();
    };
    // ResizeObserver runs after layout and before paint, so the old height goes back on before anyone sees
    // the new one.
    const observer = new ResizeObserver(([entry]) => {
      const size = entry?.borderBoxSize[0];
      if (!size) return;
      const resized = Math.abs(size.inlineSize - width) > 0.5;
      const from = running ? box.getBoundingClientRect().height : last;
      const to = size.blockSize;
      width = size.inlineSize;
      last = to;
      running?.stop();
      if (resized || reduced || Math.abs(to - from) < 0.5) {
        if (running) settle();
        return;
      }
      box.style.height = `${String(from)}px`;
      height.jump(from);
      busy.current.growing = true;
      syncClip(box, busy.current);
      tracking.onAnimationStart();
      const controls = animate(height, to, transition);
      running = controls;
      void controls.finished.then(() => {
        if (running === controls) settle();
      });
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
      if (running) {
        running.stop();
        settle();
      }
    };
  }, [reduced, transition, height, tracking]);

  return (
    <motion.div
      {...rest}
      ref={merged}
      className={cx("bt-morph", className)}
      data-bt="Morph"
      style={{ ...style, height }}
    >
      <div ref={content} data-bt-part="content">
        <AnimatePresence
          initial={false}
          mode="popLayout"
          onExitComplete={() => {
            busy.current.leaving = false;
            syncClip(outer.current, busy.current);
          }}
        >
          <MorphView key={contentKey ?? "content"} reduced={reduced}>
            {children}
          </MorphView>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
