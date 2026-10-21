import type { ReactElement } from "react";
import { LogoStrip } from "@buttery/react";

/** Marks with a shape beside the name, all in the strip's one quiet color. */
export function ShapedMarks(): ReactElement {
  return (
    <LogoStrip label="Featured in">
      <LogoStrip.Mark>
        <svg viewBox="0 0 120 24" role="img" aria-label="Halcyon">
          <circle cx="10" cy="12" r="8" fill="currentColor" />
          <text
            x="26"
            y="17"
            fontSize="14"
            fontWeight="600"
            fill="currentColor"
          >
            Halcyon
          </text>
        </svg>
      </LogoStrip.Mark>
      <LogoStrip.Mark>
        <svg viewBox="0 0 120 24" role="img" aria-label="Ferro">
          <rect x="2" y="4" width="16" height="16" rx="4" fill="currentColor" />
          <text
            x="26"
            y="17"
            fontSize="14"
            fontWeight="600"
            fill="currentColor"
          >
            Ferro
          </text>
        </svg>
      </LogoStrip.Mark>
    </LogoStrip>
  );
}
