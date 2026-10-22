import {
  Layer,
  cx,
  fadeIn,
  notifyObstacleMoved,
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
import { AnimatePresence, motion, useIsPresent } from "motion/react";
import { Toolbar } from "radix-ui";
import { useLayoutEffect, useRef } from "react";
import type {
  ComponentPropsWithRef,
  FocusEvent,
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
  /** Names the toolbar, such as "Canvas size". */
  readonly label: string;
  /** Whether it shows. Hiding it plays its exit. Defaults to `true`. */
  readonly open?: boolean | undefined;
  /** Text at its start, such as the size being cropped to. Tabular, and it truncates. */
  readonly meta?: ReactNode;
  /** Waits `delay-follow` (80ms) before arriving, so it comes in after its anchor changes, as in crop mode. */
  readonly delayed?: boolean | undefined;
  /**
   * Moves focus to its first button that can act when it opens, for a toolbar that's the next step, such
   * as crop mode's. Either way, focus inside it goes back where it came from when it closes.
   * Defaults to `false`.
   */
  readonly focusOnOpen?: boolean | undefined;
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
  focusOnOpen = false,
  className,
  children,
  onFocus,
  ref,
  ...rest
}: Omit<FloatingToolbarProps, "open">): ReactElement {
  const place = useRef<HTMLDivElement>(null);
  const toolbar = useRef<HTMLDivElement>(null);
  const cameFrom = useRef<HTMLElement | null>(null);
  const obstacle = useFloatingObstacle();
  const placeRefs = useMergedRefs(place, obstacle);
  const refs = useMergedRefs(ref, toolbar);
  const present = useIsPresent();
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
        const { clientWidth, clientHeight } =
          element.offsetParent ?? document.documentElement;
        const width = element.offsetWidth;
        const height = element.offsetHeight;
        const margin = space["2"];
        const below = box.bottom + space["3"];
        const above = box.top - space["3"] - height;
        const top = Math.round(
          Math.min(
            Math.max(
              below + height <= clientHeight - margin ? below : above,
              margin,
            ),
            Math.max(margin, clientHeight - margin - height),
          ),
        );
        const left = Math.round(
          Math.min(
            Math.max(box.left + box.width / 2 - width / 2, margin),
            Math.max(margin, clientWidth - margin - width),
          ),
        );
        const position = `${String(left)},${String(top)}`;
        if (position !== last) {
          last = position;
          element.style.left = `${String(left)}px`;
          element.style.top = `${String(top)}px`;
          notifyObstacleMoved();
        }
      }
      frame = requestAnimationFrame(follow);
    };
    follow();
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [anchor]);

  useLayoutEffect(() => {
    if (focusOnOpen) {
      toolbar.current
        ?.querySelector<HTMLElement>(
          'button:not(:disabled, [aria-disabled="true"])',
        )
        ?.focus();
    }
  }, [focusOnOpen]);

  useLayoutEffect(() => {
    if (present || toolbar.current?.contains(document.activeElement) !== true)
      return;
    if (cameFrom.current?.isConnected === true) cameFrom.current.focus();
  }, [present]);

  const remember = (event: FocusEvent<HTMLDivElement>): void => {
    onFocus?.(event);
    const from = event.relatedTarget;
    if (from instanceof HTMLElement && !event.currentTarget.contains(from)) {
      cameFrom.current = from;
    }
  };

  return (
    <div ref={placeRefs} data-bt-part="floating-toolbar-place">
      <motion.div
        {...tracking}
        initial={preset.initial}
        animate={preset.animate}
        exit={preset.exit}
      >
        <Toolbar.Root
          {...rest}
          ref={refs}
          onFocus={remember}
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
              title={
                typeof meta === "string" || typeof meta === "number"
                  ? String(meta)
                  : undefined
              }
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
 * toolbar: one Tab stop, with the arrow keys moving between its buttons. It can take focus as it opens
 * (`focusOnOpen`), and focus inside it goes back where it came from as it closes.
 *
 * @example
 * <FloatingToolbar anchor={frame} label="Canvas size" meta="1920 × 1080" delayed focusOnOpen>
 *   <FloatingToolbar.Button variant="ghost" onClick={revert}>Revert</FloatingToolbar.Button>
 *   <FloatingToolbar.Button onClick={discard}>Discard</FloatingToolbar.Button>
 *   <FloatingToolbar.Button variant="primary" onClick={keep}>Keep size</FloatingToolbar.Button>
 * </FloatingToolbar>
 */
export const FloatingToolbar: FloatingToolbarComponent = Object.assign(
  FloatingToolbarRoot,
  { Button: FloatingToolbarButton },
);
