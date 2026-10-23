import type { ReactElement } from "react";
import { Reveal, Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";

/** A quote that fades in once as it scrolls into view. */
export function QuoteReveal(): ReactElement {
  return (
    <Reveal>
      <Stack gap={2} asChild>
        <figure>
          <Text variant="body-lg" asChild>
            <blockquote>
              We built the whole launch deck in an afternoon.
            </blockquote>
          </Text>
          <Text variant="caption" asChild>
            <figcaption>A product team in Lisbon</figcaption>
          </Text>
        </figure>
      </Stack>
    </Reveal>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("We built the whole launch deck in an afternoon.");
};
