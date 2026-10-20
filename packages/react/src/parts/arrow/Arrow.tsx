import type { ReactElement } from "react";

/** Which way a navigation arrow points: `"forward"` (› becomes →) or `"back"` (‹ becomes ←). */
export type ArrowDirection = "forward" | "back";

/** Props for `Arrow`. */
export interface ArrowProps {
  /** Which way it points. Back mirrors forward. */
  readonly direction: ArrowDirection;
}

/**
 * The navigation arrow `Button` and `ArrowLink` draw beside their label: a chevron that grows a stem into
 * an arrow while the control holding it, marked `data-arrow`, is hovered or focused. Only transforms
 * change, so the control never changes size: the head nudges into room the control keeps for it (a
 * button's padding, a link's wider arrow box).
 */
export function Arrow({ direction }: ArrowProps): ReactElement {
  return (
    <svg
      className="bt-arrow"
      data-bt-part="arrow"
      data-direction={direction}
      viewBox="0 0 6 16"
      preserveAspectRatio="xMinYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <g data-bt-part="arrow-tip">
        <path data-bt-part="arrow-stem" d="M1 8h7" />
        <path data-bt-part="arrow-head" d="M4 4l4 4-4 4" />
      </g>
    </svg>
  );
}
