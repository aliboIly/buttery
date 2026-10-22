import type { ReactElement } from "react";
import { Reveal, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

/** A quote that fades in once as it scrolls into view. */
export function QuoteReveal(): ReactElement {
  return (
    <Reveal>
      <Stack gap={2} asChild>
        <figure>
          <Text variant="body-lg" asChild>
            <blockquote>We made our launch cards in an afternoon.</blockquote>
          </Text>
          <Text variant="caption" asChild>
            <figcaption>A small studio in Lisbon</figcaption>
          </Text>
        </figure>
      </Stack>
    </Reveal>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("We made our launch cards in an afternoon.");
};
