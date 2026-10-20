import type { ReactElement } from "react";
import { Reveal, Stack, Surface, Text } from "@buttery/core";

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
            Start from a template, swap the photo and export.
          </Text>
        </Stack>
      </Surface>
    </Reveal>
  );
}
