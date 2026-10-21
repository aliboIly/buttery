import { Inline, Text } from "@buttery/core";
import type { ExamplePlay } from "@buttery/core";
import { ScopeBadge } from "@buttery/react";
import type { ReactElement } from "react";

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

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "All shops");
  await see("Changes here apply to every Halfmoon shop, not just this one.");
};
