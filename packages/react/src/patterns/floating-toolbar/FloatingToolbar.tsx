import {
  Layer,
  cx,
  fadeIn,
  space,
  spring,
  timing,
  presencePresets,
  reducedPresence,
  useAnimationTracking,
  useFloatingObstacle,
  useMergedRefs,
  useMotionPreference,
} from "@buttery/core";
import type { PresenceMotion } from "@buttery/core";
import { AnimatePresence, motion } from "motion/react";
import { Toolbar } from "radix-ui";
import { useLayoutEffect, useRef } from "react";
import type {
  ComponentPropsWithRef,
  ReactElement,
  ReactNode,
  RefObject,
} from "react";
import { Button } from "../../components/button/Button.tsx";
import type { ButtonProps } from "../../components/button/Button.tsx";

/** Props for `FloatingToolbar`. Other div props go to the toolbar. */
export interface FloatingToolbarProps extends Omit<
  ComponentPropsWithRef<"div">,
  "children" | "dir"
> {
  /** Which way the arrow keys run: `"ltr"` or `"rtl"`. Follows the page when left out. */
  readonly dir?: "ltr" | "rtl" | undefined;
  /** The element it sits under, such as the crop frame. It follows the element as it moves. */
  readonly anchor: RefObject<HTMLElement | null>;
  /** Names the toolbar, such as "Crop". */
  readonly label: string;
  /** Whether it shows. Hiding it plays its exit. Defaults to `true`. */
  readonly open?: boolean | undefined;
  /** Text at its start, such as the size being cropped to. Tabular, and it truncates. */
  readonly meta?: ReactNode;
  /** Waits `delay-follow` (80ms) before arriving, so it comes in after its anchor changes, as in crop mode. */
  readonly delayed?: boolean | undefined;
  /** The buttons: `FloatingToolbar.Button`s. */
  readonly children: ReactNode;
}

function delayedMotion(motionPreset: PresenceMotion): PresenceMotion {
  const delay = timing["delay-follow"] / 1000;
  return {
    ...motionPreset,
    animate: {
      ...motionPreset.animate,
      transition: {
        default: { ...spring.smooth, delay },
        opacity: { ...fadeIn, delay },
      },
    },
  };
}

function Placed({
  anchor,
  label,
  meta,
  delayed,
  className,
  children,
  ref,
  ...rest
}: Omit<FloatingToolbarProps, "open">): ReactElement {
  const place = useRef<HTMLDivElement>(null);
  const obstacle = useFloatingObstacle();
  const refs = useMergedRefs(ref, obstacle);
  const reduced = useMotionPreference() === "reduced";
  const tracking = useAnimationTracking();
  const preset = reduced
    ? reducedPresence
    : delayed === true
      ? delayedMotion(presencePresets.rise)
      : presencePresets.rise;

  useLayoutEffect(() => {
    let frame = 0;
    let last = "";
    const follow = (): void => {
      const target = anchor.current;
      const element = place.current;
      if (target && element) {
        const box = target.getBoundingClientRect();
        const width = element.offsetWidth;
        const height = element.offsetHeight;
        const margin = space["2"];
        const below = box.bottom + space["3"];
        const top =
          below + height <= window.innerHeight - margin
            ? below
            : Math.max(margin, box.top - space["3"] - height);
        const left = Math.min(
          Math.max(box.left + box.width / 2 - width / 2, margin),
          Math.max(margin, window.innerWidth - margin - width),
        );
        const position = `${String(Math.round(left))},${String(Math.round(top))}`;
        if (position !== last) {
          last = position;
          element.style.insetInlineStart = `${String(Math.round(left))}px`;
          element.style.insetBlockStart = `${String(Math.round(top))}px`;
        }
      }
      frame = requestAnimationFrame(follow);
    };
    follow();
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [anchor]);

  return (
    <div ref={place} data-bt-part="floating-toolbar-place">
      <motion.div
        {...tracking}
        initial={preset.initial}
        animate={preset.animate}
        exit={preset.exit}
      >
        <Toolbar.Root
          {...rest}
          ref={refs}
          aria-label={label}
          className={cx("bt-floating-toolbar", className)}
          data-bt="FloatingToolbar"
        >
          {meta === undefined ? null : (
            <span
              className="bt-text bt-truncate"
              data-role="control"
              data-bt-part="meta"
              data-bt-truncate=""
              title={typeof meta === "string" ? meta : undefined}
            >
              {meta}
            </span>
          )}
          {children}
        </Toolbar.Root>
      </motion.div>
    </div>
  );
}

function FloatingToolbarRoot({
  open = true,
  ...rest
}: FloatingToolbarProps): ReactElement {
  return (
    <AnimatePresence>
      {open ? (
        <Layer band="floating" key="toolbar">
          <Placed {...rest} />
        </Layer>
      ) : null}
    </AnimatePresence>
  );
}

/** Props for `FloatingToolbar.Button`: a `Button`, 36px tall by default. */
export type FloatingToolbarButtonProps = ButtonProps;

/** One action in the toolbar. Arrow keys move between them; Tab leaves the toolbar. */
export function FloatingToolbarButton(
  props: FloatingToolbarButtonProps,
): ReactElement {
  return (
    <Toolbar.Button asChild>
      <Button {...props} />
    </Toolbar.Button>
  );
}

/** `FloatingToolbar` with its `Button`. */
export interface FloatingToolbarComponent {
  (props: FloatingToolbarProps): ReactElement;
  /** One action in the toolbar. */
  readonly Button: typeof FloatingToolbarButton;
}

/**
 * A 48px pill of actions that floats 12px under an element, centered on it and kept 8px inside the
 * viewport (above the element when there's no room below), following it as it moves. Toasts and notices
 * move out of its way. It rises in, optionally a beat after its anchor changes, and fades out. It's a
 * toolbar: one Tab stop, with the arrow keys moving between its buttons.
 *
 * @example
 * <FloatingToolbar anchor={frame} label="Crop" meta="1600 × 900" delayed>
 *   <FloatingToolbar.Button variant="ghost" onClick={reset}>Reset</FloatingToolbar.Button>
 *   <FloatingToolbar.Button onClick={cancel}>Cancel</FloatingToolbar.Button>
 *   <FloatingToolbar.Button variant="primary" onClick={apply}>Apply crop</FloatingToolbar.Button>
 * </FloatingToolbar>
 */
export const FloatingToolbar: FloatingToolbarComponent = Object.assign(
  FloatingToolbarRoot,
  { Button: FloatingToolbarButton },
);
