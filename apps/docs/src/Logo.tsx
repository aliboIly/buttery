import type { ReactElement } from "react";
import "./logo.css";

/**
 * buttery's logo: the butter emoji (U+1F9C8), drawn by the system's own emoji font, so each platform shows
 * its own butter. Hidden from screen readers, since the name is written beside it or the page says it.
 */
export function Logo({
  size = "sm",
}: {
  /** `"xs"` inside a small button, `"sm"` beside the name in a bar, `"lg"` over a headline. Defaults to `"sm"`. */
  readonly size?: "xs" | "sm" | "lg";
}): ReactElement {
  return (
    <span className="docs-logo" data-size={size} aria-hidden="true">
      🧈
    </span>
  );
}
