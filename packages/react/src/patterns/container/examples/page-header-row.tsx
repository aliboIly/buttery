import type { ReactElement } from "react";
import { Inline, Text } from "@buttery/core";
import { ArrowLink, Container } from "@buttery/react";

/** A row across the top of a page, lined up with the sections under it. */
export function PageHeaderRow(): ReactElement {
  return (
    <Container asChild>
      <header>
        <Inline gap={4} align="center" justify="between">
          <Text variant="title">Card Studio</Text>
          <ArrowLink href="#start">Open the studio</ArrowLink>
        </Inline>
      </header>
    </Container>
  );
}
