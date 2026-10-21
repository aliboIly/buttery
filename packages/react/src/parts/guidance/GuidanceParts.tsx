import {
  Icon,
  cx,
  fadeOut,
  reducedTransition,
  tabbables,
  useAnimationTracking,
  useMotionPreference,
  useReflow,
  useReflowDeparture,
  useStoredState,
} from "@buttery/core";
import { Clock } from "lucide-react";
import type { ReflowLayout } from "@buttery/core";
import type { Transition } from "motion/react";
import { VisuallyHidden } from "radix-ui";
import { useState } from "react";
import type { ComponentPropsWithRef, MouseEvent, ReactElement } from "react";

/** What a guidance part points to: a label, and where it goes or what it does. */
export interface GuidanceAction {
  /** What it says, such as "Turn on automatic refunds". */
  readonly label: string;
  /** Makes it a link to this page. */
  readonly href?: string | undefined;
  /** Runs when it's pressed, or as its link is followed, where a router can take over. */
  readonly onClick?: ((event: MouseEvent<HTMLElement>) => void) | undefined;
}

/** Props for `TimeEstimate`. */
export interface TimeEstimateProps extends Omit<
  ComponentPropsWithRef<"span">,
  "children"
> {
  /** How long it takes, such as "1 min". */
  readonly children: string;
  /** Read before the time by screen readers. Defaults to `"Takes about"`. */
  readonly label?: string | undefined;
}

/** How long something takes: a 14px clock and the time in `caption`, read as "Takes about 1 min". */
export function TimeEstimate({
  children,
  label = "Takes about",
  className,
  ...rest
}: TimeEstimateProps): ReactElement {
  return (
    <span
      {...rest}
      className={cx("bt-time-estimate bt-text", className)}
      data-role="caption"
      data-bt="TimeEstimate"
    >
      <Icon icon={Clock} />
      <VisuallyHidden.Root>{`${label} `}</VisuallyHidden.Root>
      {children}
    </span>
  );
}

/** Options for `useDismissible`. */
export interface DismissibleOptions {
  /** What kind of part it is, such as `"banner"`; it keeps different parts' stored keys apart. */
  readonly kind: string;
  /** Remembers the dismissal under this key, so it stays gone on later visits. */
  readonly storageKey?: string | undefined;
  /** Called once it has faded and gone. */
  readonly onDismiss?: (() => void) | undefined;
}

/** What `useDismissible` gives a part people can dismiss. */
export interface Dismissible {
  /** Whether it's gone, now or since an earlier visit. Render nothing when it is. */
  readonly dismissed: boolean;
  /** Starts it leaving: it fades, then it's gone. */
  readonly dismiss: () => void;
  /**
   * Spread onto its Motion root: the fade out, and the slide into place when something above it in its
   * `ReflowGroup` leaves, both reported to the settled flag.
   */
  readonly motionProps: {
    readonly initial: false;
    readonly animate: { readonly opacity: number };
    readonly transition: Transition;
    readonly layout: ReflowLayout["layout"];
    readonly layoutDependency: ReflowLayout["layoutDependency"];
    readonly onAnimationStart: () => void;
    readonly onAnimationComplete: () => void;
    readonly onLayoutAnimationStart: () => void;
    readonly onLayoutAnimationComplete: () => void;
    /** `"leaving"` while it fades, so focus in it can move on before it's gone. */
    readonly "data-bt-dismissible": "" | "leaving";
  };
}

function isFlag(value: unknown): value is boolean {
  return typeof value === "boolean";
}

/** Moves focus out of a part that's leaving, to the next tab stop after it or else the one before. */
function moveFocusOff(): void {
  const part = document.activeElement?.closest(
    '[data-bt-dismissible="leaving"]',
  );
  if (!part) return;
  const stops = tabbables(document.body).filter((stop) => !part.contains(stop));
  const after = stops.find(
    (stop) =>
      (part.compareDocumentPosition(stop) &
        Node.DOCUMENT_POSITION_FOLLOWING) !==
      0,
  );
  (after ?? stops.at(-1))?.focus();
}

/**
 * The state behind a part people can dismiss for good, such as a banner: it fades where it is over
 * `dur-fast`, then it's gone, and in a `ReflowGroup` (an `AppPage`) what's below slides up into its place,
 * as it does itself when something above it leaves. Focus in it moves on to the next tab stop as it goes.
 * With a `storageKey` it stays gone on later visits.
 *
 * @example
 * const { dismissed, dismiss, motionProps } = useDismissible({ kind: "tip", storageKey });
 * if (dismissed) return null;
 * return <motion.div {...motionProps}>… <IconButton icon={X} label="Dismiss" onClick={dismiss} /></motion.div>;
 */
export function useDismissible({
  kind,
  storageKey,
  onDismiss,
}: DismissibleOptions): Dismissible {
  const [dismissed, setDismissed] = useStoredState(
    storageKey === undefined ? undefined : `buttery:${kind}:${storageKey}`,
    false,
    isFlag,
  );
  const [leaving, setLeaving] = useState(false);
  const depart = useReflowDeparture();
  const reflow = useReflow();
  const reduced = useMotionPreference() === "reduced";
  const tracking = useAnimationTracking();
  return {
    dismissed,
    dismiss: () => {
      setLeaving(true);
    },
    motionProps: {
      initial: false,
      animate: { opacity: leaving ? 0 : 1 },
      transition: {
        ...(reduced ? reducedTransition : fadeOut),
        layout: reflow.transition,
      },
      layout: reflow.layout,
      layoutDependency: reflow.layoutDependency,
      onLayoutAnimationStart: tracking.onLayoutAnimationStart,
      onLayoutAnimationComplete: tracking.onLayoutAnimationComplete,
      "data-bt-dismissible": leaving ? "leaving" : "",
      onAnimationStart: tracking.onAnimationStart,
      onAnimationComplete: () => {
        tracking.onAnimationComplete();
        if (!leaving) return;
        moveFocusOff();
        setLeaving(false);
        setDismissed(true);
        depart();
        onDismiss?.();
      },
    },
  };
}
