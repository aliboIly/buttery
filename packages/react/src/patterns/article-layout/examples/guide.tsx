import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { ArticleLayout } from "@buttery/react";

/** A link to a section of the article, a 24px target in `body-sm`. */
function SectionLink({
  href,
  children,
}: {
  readonly href: string;
  readonly children: string;
}): ReactElement {
  return (
    <Text variant="body-sm" tone="secondary" asChild>
      <a
        href={href}
        style={{
          display: "inline-flex",
          alignItems: "center",
          minBlockSize: "var(--bt-space-6)",
          textDecoration: "none",
        }}
      >
        {children}
      </a>
    </Text>
  );
}

/** A short guide with its sections listed beside it. */
export function Guide(): ReactElement {
  return (
    <ArticleLayout
      asideLabel="On this page"
      aside={
        <Stack gap={1}>
          <SectionLink href="#title">Start with a title</SectionLink>
          <SectionLink href="#finish">Pick a finish</SectionLink>
        </Stack>
      }
    >
      <article>
        <Stack gap={4}>
          <h2 id="title" className="bt-text" data-role="heading-2">
            Start with a title
          </h2>
          <Text variant="body-lg">
            Type the title in the inspector and it lands on the card.
          </Text>
          <h2 id="finish" className="bt-text" data-role="heading-2">
            Pick a finish
          </h2>
          <Text variant="body-lg">
            Clear, Paper or Ink, each readable on any backdrop.
          </Text>
        </Stack>
      </article>
    </ArticleLayout>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("Type the title in the inspector and it lands on the card.");
  await see("Clear, Paper or Ink, each readable on any backdrop.");
};
