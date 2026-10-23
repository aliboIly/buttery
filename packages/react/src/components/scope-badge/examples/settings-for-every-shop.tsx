import type { ReactElement } from "react";
import { Inline, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { ScopeBadge } from "@butteryui/react";

/** A settings title that says its changes reach every shop, with the details a press away. */
export function SettingsForEveryShop(): ReactElement {
  return (
    <Inline gap={2} align="center">
      <Text variant="title-lg" asChild>
        <h1>Pickup hours</h1>
      </Text>
      <ScopeBadge
        label="All shops"
        info="Changes here apply to every Halfmoon shop, not just this one."
      />
    </Inline>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "All shops");
  await see("Changes here apply to every Halfmoon shop, not just this one.");
};
