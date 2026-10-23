import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { ArrowLink } from "@buttery/react";

/** A short list of recent orders with See all at its foot, and a help link that leaves the app. */
export function SeeAll(): ReactElement {
  return (
    <Stack gap={3} align="start">
      <Text variant="title">Recent orders</Text>
      <Stack gap={3}>
        <Text variant="body">Blue Door Café, 12 bags</Text>
        <Text variant="body">Rosa Delgado, 2 bags</Text>
        <Text variant="body">Little Fern Coffee, 8 bags</Text>
      </Stack>
      <ArrowLink href="#orders">See all orders</ArrowLink>
      <ArrowLink href="https://example.com/help" arrow="external">
        How wholesale prices work
      </ArrowLink>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ see }) => {
  await see("See all orders");
  await see("How wholesale prices work");
};
