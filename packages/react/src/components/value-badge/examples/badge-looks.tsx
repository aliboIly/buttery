import type { ReactElement } from "react";
import { Inline, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { ValueBadge } from "@butteryui/react";

/** A value in each look, each keeping room for 100%: soft by default, solid to stand out, outline for a quiet row. */
export function BadgeLooks(): ReactElement {
  return (
    <Inline gap={4} align="center" wrap>
      <Inline gap={2} align="center">
        <Text variant="label">Opacity</Text>
        <ValueBadge reserve={["0%", "100%"]}>80%</ValueBadge>
      </Inline>
      <Inline gap={2} align="center">
        <Text variant="label">Saturation</Text>
        <ValueBadge variant="solid" reserve={["0%", "100%"]}>
          45%
        </ValueBadge>
      </Inline>
      <Inline gap={2} align="center">
        <Text variant="label">Grain</Text>
        <ValueBadge variant="outline" reserve={["0%", "100%"]}>
          12%
        </ValueBadge>
      </Inline>
    </Inline>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ see }) => {
  await see("80%");
  await see("45%");
  await see("12%");
};
