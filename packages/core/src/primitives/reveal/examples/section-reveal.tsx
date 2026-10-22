import type { ReactElement } from "react";
import { Reveal, Stack, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

/** A page section that rises into place the first time the reader reaches it. */
export function SectionReveal(): ReactElement {
  return (
    <Reveal>
      <Surface level="card" pad={6}>
        <Stack gap={3}>
          <Text variant="heading-2" asChild>
            <h2>Every card, one click from done</h2>
          </Text>
          <Text variant="body-lg">
            Write a title, pick a backdrop, and send the card off.
          </Text>
        </Stack>
      </Surface>
    </Reveal>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ see }) => {
  await see("Every card, one click from done");
};
