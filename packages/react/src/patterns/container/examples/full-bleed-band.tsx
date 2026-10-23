import type { ReactElement } from "react";
import { Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Container, Section } from "@buttery/react";

/** A band whose background runs edge to edge while its words stay in the column. */
export function FullBleedBand(): ReactElement {
  return (
    <Section tone="muted" contained={false}>
      <Container>
        <Text variant="body-lg">
          Every deck you make keeps its own history.
        </Text>
      </Container>
    </Section>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ see }) => {
  await see("Every deck you make keeps its own history.");
};
