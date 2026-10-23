import type { ReactElement } from "react";
import { Inline, Stack, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { InfoButton } from "@buttery/react";

/** A metric card's title with an info button after it, 4px apart and centered on the title's line. */
export function InfoBesideATitle(): ReactElement {
  return (
    <Surface level="card" pad={4}>
      <Stack gap={3}>
        <Inline gap={1} align="center">
          <Text variant="title-sm">Open orders</Text>
          <InfoButton info="Orders paid for and not yet shipped." />
        </Inline>
        <Text variant="title-lg" tabular>
          18
        </Text>
        <Text variant="caption" tone="secondary">
          4 of them ship today
        </Text>
      </Stack>
    </Surface>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Orders paid for and not yet shipped.");
  await see("Orders paid for and not yet shipped.");
};
