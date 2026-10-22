import type { ReactElement } from "react";
import { Control, Inline, Surface, Text } from "@buttery/core";
import type { ControlSize } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

const SIZES = [
  { size: "badge", height: "20px" },
  { size: "sm", height: "28px" },
  { size: "control", height: "34px" },
  { size: "button", height: "36px" },
  { size: "cta", height: "48px" },
] as const satisfies readonly { size: ControlSize; height: string }[];

/** Every height, each with the inline padding that goes with it, so a control you build lines up with buttery's own. */
export function Sizes(): ReactElement {
  return (
    <Inline gap={2} align="center" wrap>
      {SIZES.map(({ size, height }) => (
        <Surface key={size} level="section" radius="full" asChild>
          <Control size={size}>
            <Text variant="control">{`${size}, ${height}`}</Text>
          </Control>
        </Surface>
      ))}
    </Inline>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ see }) => {
  await see("badge, 20px");
  await see("cta, 48px");
};
