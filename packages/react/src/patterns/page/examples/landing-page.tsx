import type { ReactElement } from "react";
import { Text } from "@buttery/core";
import { Page, Section } from "@buttery/react";

/** A page as the main landmark, its sections taking turns on the two backgrounds. */
export function LandingPage(): ReactElement {
  return (
    <Page asChild>
      <main>
        <Section title="Cards that look finished">
          <Text variant="body-lg">Write a title, pick a finish, export.</Text>
        </Section>
        <Section tone="muted" title="Made for every size">
          <Text variant="body-lg">Square, wide or tall, from one card.</Text>
        </Section>
      </main>
    </Page>
  );
}
