import { use, useLayoutEffect, useRef } from "react";
import type { ComponentPropsWithRef, ReactElement } from "react";
import { useMotionPreference } from "../../motion/preference.ts";
import { revealOnce } from "../../motion/reveal.ts";
import { AnimationTrackingContext } from "../../motion/use-animation-tracking.ts";
import { cx } from "../../utils/cx.ts";
import { useMergedRefs } from "../../utils/merge-refs.ts";

/** Props for `Reveal`. */
export type RevealProps = ComponentPropsWithRef<"div">;

/**
 * Fades its content in and lifts it 16px the first time it scrolls 15% into view, with `spring.gentle`.
 * Content already in view when the page loads gets a single 200ms fade instead, and with reduced motion
 * it simply shows.
 *
 * @example
 * <Reveal>
 *   <Bento>…</Bento>
 * </Reveal>
 */
export function Reveal({ className, ref, ...rest }: RevealProps): ReactElement {
  const reduced = useMotionPreference() === "reduced";
  const tracked = use(AnimationTrackingContext);
  const element = useRef<HTMLDivElement>(null);
  const shown = useRef(false);
  const merged = useMergedRefs(ref, element);

  useLayoutEffect(() => {
    const node = element.current;
    if (!node) return undefined;
    if (reduced || shown.current) {
      shown.current = true;
      return undefined;
    }
    return revealOnce(node, [node], {
      tracked,
      stepped: false,
      onShown: () => {
        shown.current = true;
      },
    });
  }, [reduced, tracked]);

  return (
    <div
      {...rest}
      ref={merged}
      className={cx("bt-reveal", className)}
      data-bt="Reveal"
    />
  );
}
