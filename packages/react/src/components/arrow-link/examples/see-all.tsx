import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { ArrowLink } from "@buttery/react";

/** A short list of recent cards with See all at its foot, and a help link that leaves the app. */
export function SeeAll(): ReactElement {
  return (
    <Stack gap={3} align="start">
      <Text variant="title">Recent cards</Text>
      <Stack gap={2}>
        <Text variant="body">Spring launch</Text>
        <Text variant="body">Studio open day</Text>
        <Text variant="body">Winter catalog</Text>
      </Stack>
      <ArrowLink href="#cards">See all cards</ArrowLink>
      <ArrowLink href="https://example.com/help" arrow="external">
        How cards are shared
      </ArrowLink>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ see }) => {
  await see("See all cards");
  await see("How cards are shared");
};
