import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import { ArrowLink, ArticleLayout } from "@buttery/react";

/** Release notes with links to related reading beside them. */
export function RelatedLinks(): ReactElement {
  return (
    <ArticleLayout
      asideLabel="Related"
      aside={
        <Stack gap={3}>
          <Text variant="label" tone="secondary">
            Related
          </Text>
          <ArrowLink href="#shortcuts">Keyboard shortcuts</ArrowLink>
          <ArrowLink href="#export">Export sizes</ArrowLink>
        </Stack>
      }
    >
      <article>
        <Stack gap={4}>
          <h2 className="bt-text" data-role="heading-2">
            What's new in 2.4
          </h2>
          <Text variant="body-lg">
            Cards lean further, exports keep their shadow, and Undo remembers
            every change you make.
          </Text>
        </Stack>
      </article>
    </ArticleLayout>
  );
}
