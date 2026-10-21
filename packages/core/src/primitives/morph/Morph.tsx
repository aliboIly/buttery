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

const quick: Transition = {
  duration: durations.fast / 1000,
  ease: easingCurves.standard,
};

interface Busy {
  growing: boolean;
  leaving: boolean;
}

// The content stays clipped while the height moves, and while swapped-out content that's taller than the box
// fades away. Content of the same height isn't clipped, so trimmed text keeps its glyphs' tops and tails.
function syncClip(
  element: HTMLElement | null,
  { growing, leaving }: Busy,
): void {
  if (element === null) return;
  const spills = element.scrollHeight > element.clientHeight + 0.5;
  element.toggleAttribute("data-animating", growing || (leaving && spills));
}

function MorphView({
  reduced,
  children,
}: {
  readonly reduced: boolean;
  readonly children: ReactNode;
}): ReactElement {
  const tracking = useAnimationTracking();
  const transition = reduced ? reducedTransition : quick;
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
  /**
   * Opens on `spring.snappy` and closes over `dur-fast`, as a disclosure such as a sidebar group does,
   * instead of following the content on `spring.smooth` both ways. Defaults to `false`.
   */
  readonly disclosure?: boolean | undefined;
}

/**
 * One container whose content can swap or grow: its height follows the content with `spring.smooth` and
 * swapped content crossfades in place. Between changes it sits at its natural height, so text that
 * rewraps when the window resizes never spills out, and a size change that comes without a change to the
 * content, such as a web font swapping in, takes effect at once. With reduced motion the height jumps and
 * the crossfade takes 100ms.
 *
 * @example
 * <Morph contentKey={fill}>
 *   {fill === "gradient" ? <GradientSwatches /> : <SolidSwatches />}
 * </Morph>
 */
export function Morph({
  contentKey,
  disclosure = false,
  className,
  style,
  ref,
  children,
  ...rest
}: MorphProps): ReactElement {
  const reduced = useMotionPreference() === "reduced";
  const smooth = useButteryTransition("smooth");
  const snappy = useButteryTransition("snappy");
  const grow = disclosure ? snappy : smooth;
  const shrink = disclosure && !reduced ? quick : smooth;
  const tracking = useAnimationTracking();
  const height = useMotionValue<number | string>("auto");
  const outer = useRef<HTMLDivElement>(null);
  const merged = useMergedRefs(ref, outer);
  const content = useRef<HTMLDivElement>(null);
  const busy = useRef<Busy>({ growing: false, leaving: false });
  const shownKey = useRef(contentKey);
  const rendered = useRef(false);
  const markRendered = useRef<() => void>(() => undefined);

  // A change to the content's DOM marks the next layouts as its own for two frames. A size change with no
  // DOM change, such as a web font swapping in just after the page loads, is followed at once.
  useLayoutEffect(() => {
    const node = content.current;
    if (!node) return undefined;
    let next = 0;
    let later = 0;
    const mark = (): void => {
      rendered.current = true;
      cancelAnimationFrame(next);
      cancelAnimationFrame(later);
      next = requestAnimationFrame(() => {
        later = requestAnimationFrame(() => {
          rendered.current = false;
        });
      });
    };
    markRendered.current = mark;
    const observer = new MutationObserver(mark);
    observer.observe(node, {
      childList: true,
      characterData: true,
      attributes: true,
      subtree: true,
    });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(next);
      cancelAnimationFrame(later);
    };
  }, []);

  useLayoutEffect(() => {
    if (shownKey.current === contentKey) return;
    shownKey.current = contentKey;
    markRendered.current();
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
      const animating = running !== null;
      running?.stop();
      if (
        resized ||
        reduced ||
        Math.abs(to - from) < 0.5 ||
        (!rendered.current && !animating)
      ) {
        if (animating) settle();
        return;
      }
      box.style.height = `${String(from)}px`;
      height.jump(from);
      busy.current.growing = true;
      syncClip(box, busy.current);
      tracking.onAnimationStart();
      const controls = animate(height, to, to > from ? grow : shrink);
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
  }, [reduced, grow, shrink, height, tracking]);

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
