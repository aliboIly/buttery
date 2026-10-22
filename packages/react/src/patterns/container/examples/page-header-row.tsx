import type { ReactElement } from "react";
import { Inline, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { ArrowLink, Container } from "@buttery/react";

/** A row across the top of a page, lined up with the sections under it. */
export function PageHeaderRow(): ReactElement {
  return (
    <Container asChild>
      <header>
        <Inline gap={4} align="center" justify="between">
          <Text variant="title">Deckhand</Text>
          <ArrowLink href="#start">Start a deck</ArrowLink>
        </Inline>
      </header>
    </Container>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("Deckhand");
  await see("Start a deck");
};
