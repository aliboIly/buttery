import type { MotionStyle } from "motion/react";
import type { ComponentPropsWithRef, JSX } from "react";

/**
 * A DOM element's props for a component that renders a Motion element: without the handlers Motion
 * redefines (`onAnimationStart` and the drag events), and with Motion's `style`, which also takes motion
 * values.
 */
export type MotionElementProps<Tag extends keyof JSX.IntrinsicElements> = Omit<
  ComponentPropsWithRef<Tag>,
  "style" | "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd"
> & {
  /** Inline styles, which can include motion values. */
  readonly style?: MotionStyle;
};
