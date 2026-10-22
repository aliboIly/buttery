import type { ReactElement } from "react";
import { useAnimationTracking, useButteryTransition } from "@buttery/core";
import { motion } from "motion/react";

/**
 * How far something has got, as a bar that fills with `spring.smooth`: a checklist's ticked tasks or a
 * release's landed items. Named by `label`, and read out as `valueText`, such as "2 of 4 done".
 */
export function Progress({
  value,
  max,
  label,
  valueText,
}: {
  readonly value: number;
  readonly max: number;
  /** What it measures, such as "Launch checklist". */
  readonly label: string;
  readonly valueText: string;
}): ReactElement {
  const smooth = useButteryTransition("smooth");
  const tracking = useAnimationTracking();
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={valueText}
      className="docs-progress"
    >
      <motion.span
        {...tracking}
        className="docs-progress-fill"
        initial={false}
        animate={{ scaleX: max === 0 ? 0 : value / max }}
        transition={smooth}
      />
    </div>
  );
}
