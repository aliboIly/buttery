import type { ReactElement } from "react";
import { useId } from "react";
import { gradients, solids } from "@buttery/core/palettes";

const VIOLET = gradients.find((preset) => preset.id === "violet");
const PAPER = solids.find((solid) => solid.id === "paper")?.hex ?? "#f7f3ec";

/** Card Studio's own app mark: a tilted card on a violet tile. */
export function CardStudioMark(): ReactElement {
  const id = useId();
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={VIOLET?.fromHex ?? "#a78bfa"} />
          <stop offset="1" stopColor={VIOLET?.toHex ?? "#6d28d9"} />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill={`url(#${id})`} />
      <rect
        x="6"
        y="8"
        width="12"
        height="8"
        rx="2"
        fill={PAPER}
        transform="rotate(-8 12 12)"
      />
    </svg>
  );
}
