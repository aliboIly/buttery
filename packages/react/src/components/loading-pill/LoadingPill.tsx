import {
  cx,
  presencePresets,
  reducedPresence,
  timing,
  useAnimationTracking,
  useMotionPreference,
} from "@buttery/core";
import type { MotionElementProps } from "@buttery/core";
import { AnimatePresence, motion } from "motion/react";
import { VisuallyHidden } from "radix-ui";
import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { Spinner } from "../../parts/spinner/Spinner.tsx";

/** Props for `LoadingPill`. */
export interface LoadingPillProps extends MotionElementProps<"div"> {
  /** What's loading, beside the spinner and announced. Defaults to `"Loading"`. */
  readonly label?: string | undefined;
  /**
   * Whether something is loading. The pill shows once this has been true for `--bt-delay-loading` (300ms),
   * so a quick load never flashes it, and fades away as soon as it turns false. Defaults to `true`.
   */
  readonly loading?: boolean | undefined;
  /**
   * Whether its words are read out as it shows. Defaults to `true`; turn it off when something around it
   * already says it's loading, such as a card marked busy.
   */
  readonly announce?: boolean | undefined;
}

/**
 * A small pill that says something is loading: 28px tall, `bg-control`, a 14px spinner and its label in the
 * `control` role, announced as a status. It waits `--bt-delay-loading` (300ms) before it shows and fades in
 * and out over `dur-fast`, so quick loads never flash it. Its spinner holds still with reduced motion.
 *
 * @example
 * <LoadingPill loading={!data} label="Loading orders" />
 */
export function LoadingPill({
  label = "Loading",
  loading = true,
  announce = true,
  className,
  ...rest
}: LoadingPillProps): ReactElement {
  const reduced = useMotionPreference() === "reduced";
  const tracking = useAnimationTracking();
  const [waited, setWaited] = useState(false);
  const [wasLoading, setWasLoading] = useState(loading);
  const fade = reduced ? reducedPresence : presencePresets.scrim;

  if (loading !== wasLoading) {
    setWasLoading(loading);
    if (!loading) setWaited(false);
  }

  useEffect(() => {
    if (!loading) return undefined;
    const timer = window.setTimeout(() => {
      setWaited(true);
    }, timing["delay-loading"]);
    return () => {
      window.clearTimeout(timer);
    };
  }, [loading]);

  const showing = loading && waited;
  return (
    <>
      {/* Mounted while the pill isn't, so its words are announced as they arrive rather than with it. */}
      {announce ? (
        <VisuallyHidden.Root role="status">
          {showing ? label : ""}
        </VisuallyHidden.Root>
      ) : null}
      <AnimatePresence>
        {showing ? (
          <motion.div
            key="loading"
            aria-hidden="true"
            {...rest}
            {...tracking}
            className={cx("bt-loading-pill", className)}
            data-bt="LoadingPill"
            initial={fade.initial}
            animate={fade.animate}
            exit={fade.exit}
          >
            <Spinner />
            <span data-bt-part="label">{label}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
