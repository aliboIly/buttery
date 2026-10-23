import type { ReactElement } from "react";

/** The roastery's mark: a moon half in shadow, drawn in the text color so it follows the theme. */
export function HalfmoonMark(): ReactElement {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="9.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M12 2.75a9.25 9.25 0 0 0 0 18.5z" fill="currentColor" />
    </svg>
  );
}
