import type { ReactElement } from "react";
import { Reveal, Stack, Surface, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";

/** A page section that rises into place the first time the reader reaches it. */
export function SectionReveal(): ReactElement {
  return (
    <Reveal>
      <Surface level="card" pad={6}>
        <Stack gap={3}>
          <Text variant="heading-2" asChild>
            <h2>Every deck, one click from presenting</h2>
          </Text>
          <Text variant="body-lg">
            Write the slides, pick a theme, and present from any screen.
          </Text>
        </Stack>
      </Surface>
    </Reveal>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ see }) => {
  await see("Every deck, one click from presenting");
};
