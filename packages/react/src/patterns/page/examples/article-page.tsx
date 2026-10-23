import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Page, Section } from "@butteryui/react";

/** A single long section of reading on a page, its headline sized by the page's own width. */
export function ArticlePage(): ReactElement {
  return (
    <Page>
      <Section size="sm">
        <Stack gap={4}>
          <Text variant="heading-1">Designing a title slide</Text>
          <Text variant="body-lg">
            Start with the words. A good title fits on one line, big enough to
            read from the back of the room.
          </Text>
        </Stack>
      </Section>
    </Page>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("Designing a title slide");
};
