import type { ReactElement } from "react";
import { Inline, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { ValueBadge } from "@buttery/react";

/** A percentage that never shifts its label as it grows from 0% to 100%. */
export function PercentBadge(): ReactElement {
  return (
    <Inline gap={2} align="center">
      <Text variant="label">Opacity</Text>
      <ValueBadge reserve={["0%", "100%"]}>80%</ValueBadge>
    </Inline>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("80%");
};
