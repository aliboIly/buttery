import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { LogoStrip } from "@butteryui/react";

const NAMES = ["Tidewater", "Bramble", "Quillwork", "Halcyon"] as const;

/** Customers' wordmarks drawn as svgs in currentColor, so they take the strip's quiet color. */
export function CustomerMarks(): ReactElement {
  return (
    <LogoStrip label="Teams that present with Deckhand">
      {NAMES.map((name) => (
        <LogoStrip.Mark key={name}>
          <svg viewBox="0 0 120 24" role="img" aria-label={name}>
            <text
              x="0"
              y="17"
              fontSize="15"
              fontWeight="600"
              fill="currentColor"
            >
              {name}
            </text>
          </svg>
        </LogoStrip.Mark>
      ))}
    </LogoStrip>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("Tidewater");
  await see("Halcyon");
};
