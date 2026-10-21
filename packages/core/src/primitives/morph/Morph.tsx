import { AnimatePresence, animate, motion, useMotionValue } from "motion/react";
import type { AnimationPlaybackControls, Transition } from "motion/react";
import { createContext, use, useLayoutEffect, useMemo, useRef } from "react";
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

/** How a `Morph` inside another one tells it that its height is moving, so the outer one follows at once. */
interface MorphParent {
  readonly follow: () => void;
  readonly unfollow: () => void;
}

const MorphParentContext = createContext<MorphParent | null>(null);

// A change inside a nested Morph, its own box's height included, is that Morph's to animate.
function ownChange(record: MutationRecord, box: Element): boolean {
  const target =
    record.target instanceof Element
      ? record.target
      : record.target.parentElement;
  return target?.closest('[data-bt="Morph"]') === box;
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
 * content, such as a web font swapping in, takes effect at once. A `Morph` inside another one moves on its own
 * while the outer one follows it. With reduced motion the height jumps and the crossfade takes 100ms.
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
  const hold = useRef<() => void>(() => undefined);
  const release = useRef<() => void>(() => undefined);
  const followers = useRef(0);
  const follow = useRef<() => void>(() => undefined);
  const parent = use(MorphParentContext);
  const asParent = useMemo<MorphParent>(
    () => ({
      follow: () => {
        followers.current += 1;
        follow.current();
      },
      unfollow: () => {
        followers.current = Math.max(0, followers.current - 1);
      },
    }),
    [],
  );

  // A change to the content's DOM marks the next layouts as its own for two frames, and holds the box at its
  // last height until the next layout has been measured. A size change with no DOM change, such as a web font
  // swapping in just after the page loads, is followed at once.
  useLayoutEffect(() => {
    const node = content.current;
    const box = outer.current;
    if (!node || !box) return undefined;
    let next = 0;
    let later = 0;
    const mark = (): void => {
      rendered.current = true;
      hold.current();
      cancelAnimationFrame(next);
      cancelAnimationFrame(later);
      next = requestAnimationFrame(() => {
        later = requestAnimationFrame(() => {
          rendered.current = false;
          release.current();
        });
      });
    };
    markRendered.current = mark;
    const observer = new MutationObserver((records) => {
      if (records.some((record) => ownChange(record, box))) mark();
    });
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
    let held = false;
    let leading = false;
    const toAuto = (): void => {
      box.style.height = "auto";
      height.jump("auto");
    };
    const settle = (): void => {
      running = null;
      held = false;
      toAuto();
      busy.current.growing = false;
      syncClip(box, busy.current);
      tracking.onAnimationComplete();
      if (leading) {
        leading = false;
        parent?.unfollow();
      }
    };
    // Holding the old height before layout, rather than putting it back from inside the ResizeObserver, keeps
    // everything around the box still while the browser delivers its notifications; resizing it there makes
    // the browser report a ResizeObserver loop to any observer of an ancestor.
    hold.current = () => {
      if (reduced || running !== null || held || followers.current > 0) return;
      held = true;
      box.style.height = `${String(last)}px`;
      height.jump(last);
    };
    release.current = () => {
      if (!held || running !== null) return;
      held = false;
      toAuto();
    };
    // A nested Morph starts moving while its own box still holds its old height, so letting go here changes
    // nothing on screen.
    follow.current = () => {
      if (running !== null) settle();
      else if (held) release.current();
    };
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
        followers.current > 0 ||
        Math.abs(to - from) < 0.5 ||
        (!rendered.current && !animating)
      ) {
        if (animating || held) settle();
        return;
      }
      if (!held) {
        box.style.height = `${String(from)}px`;
        height.jump(from);
      }
      held = false;
      busy.current.growing = true;
      syncClip(box, busy.current);
      tracking.onAnimationStart();
      if (!leading && parent) {
        leading = true;
        parent.follow();
      }
      const controls = animate(height, to, to > from ? grow : shrink);
      running = controls;
      void controls.finished.then(() => {
        if (running === controls) settle();
      });
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
      hold.current = () => undefined;
      release.current = () => undefined;
      follow.current = () => undefined;
      if (running) {
        running.stop();
        settle();
      } else if (leading) {
        leading = false;
        parent?.unfollow();
      }
    };
  }, [reduced, grow, shrink, height, tracking, parent]);

  return (
    <motion.div
      {...rest}
      ref={merged}
      className={cx("bt-morph", className)}
      data-bt="Morph"
      style={{ ...style, height }}
    >
      <div ref={content} data-bt-part="content">
        <MorphParentContext value={asParent}>
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
        </MorphParentContext>
      </div>
    </motion.div>
  );
}
