import { AnimatePresence, motion } from "motion/react";
import type { ReactElement } from "react";
import { useMotionPreference } from "../../motion/preference.ts";
import type { MotionElementProps } from "../../motion/props.ts";
import { presencePresets, reducedPresence } from "../../motion/presets.ts";
import type { PresencePreset } from "../../motion/presets.ts";
import { useAnimationTracking } from "../../motion/use-animation-tracking.ts";
import { cx } from "../../utils/cx.ts";

export type { PresencePreset } from "../../motion/presets.ts";

/** Props for `Presence`. */
export interface PresenceProps extends MotionElementProps<"div"> {
  /** Whether the content is shown. Turning it off plays the exit before the content unmounts. */
  readonly show: boolean;
  /** How the content arrives. Defaults to `"fade"`. */
  readonly preset?: PresencePreset | undefined;
}

/**
 * Shows and hides its content with an enter and an exit from the motion presets. Exits are quicker than
 * entrances, and with reduced motion both are a 100ms fade. Its content renders in a `div` while shown.
 *
 * @example
 * <Presence show={saved} preset="rise">
 *   <Text variant="caption">Saved</Text>
 * </Presence>
 */
export function Presence({
  show,
  preset = "fade",
  className,
  children,
  ...rest
}: PresenceProps): ReactElement {
  const reduced = useMotionPreference() === "reduced";
  const tracking = useAnimationTracking();
  const motionPreset = reduced ? reducedPresence : presencePresets[preset];
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key="presence"
          {...rest}
          {...tracking}
          className={cx("bt-presence", className)}
          data-bt="Presence"
          data-preset={preset}
          initial={motionPreset.initial}
          animate={motionPreset.animate}
          exit={motionPreset.exit}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
