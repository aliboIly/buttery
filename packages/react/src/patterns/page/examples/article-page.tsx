import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import { Page, Section } from "@buttery/react";

/** A single long section of reading on a page. */
export function ArticlePage(): ReactElement {
  return (
    <Page>
      <Section size="sm">
        <Stack gap={4}>
          <Text variant="heading-1">Designing a launch card</Text>
          <Text variant="body-lg">
            Start with the words. A good title fits on one line at the size
            people will see it.
          </Text>
        </Stack>
      </Section>
    </Page>
  );
}
