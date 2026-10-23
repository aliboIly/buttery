import { useId } from "react";
import type { ReactElement } from "react";
import { gradients } from "@buttery/core/palettes";
import { BOX_COLORS, INK_DARK } from "./geometry.ts";

const APRICOT = gradients.find((preset) => preset.id === "apricot");

/** Deckhand's own app mark: a slide in front of the one behind it, on an apricot tile. */
export function DeckhandMark(): ReactElement {
  const id = useId();
  const paper = BOX_COLORS.light.fill;
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={APRICOT?.fromHex} />
          <stop offset="1" stopColor={APRICOT?.toHex} />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill={`url(#${id})`} />
      <rect
        x="7"
        y="5.5"
        width="11"
        height="7.5"
        rx="1.5"
        fill={paper}
        opacity="0.6"
      />
      <rect x="4.5" y="8.5" width="15" height="10" rx="2" fill={paper} />
      <rect x="7" y="11.5" width="7" height="1.75" rx="0.875" fill={INK_DARK} />
      <rect
        x="7"
        y="14.75"
        width="4.5"
        height="1.25"
        rx="0.625"
        fill={INK_DARK}
        opacity="0.5"
      />
    </svg>
  );
}
