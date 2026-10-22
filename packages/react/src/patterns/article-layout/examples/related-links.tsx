import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import {
  ArrowLink,
  ArticleLayout,
  Button,
  Page,
  Section,
} from "@buttery/react";

/** A release notes page: the notes on the page grid, related reading beside them and a feedback row after them. */
export function RelatedLinks(): ReactElement {
  const [answer, setAnswer] = useState<"yes" | "no" | null>(null);
  return (
    <Page>
      <Section size="sm">
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
            <Stack gap={6}>
              <Stack gap={4}>
                <h2 className="bt-text" data-role="heading-2">
                  What's new in 2.4
                </h2>
                <Text variant="body-lg">
                  Cards lean further, exports keep their shadow, and Undo
                  remembers every change you make.
                </Text>
              </Stack>
              <Inline gap={2} align="center" wrap>
                <Text variant="body-sm" tone="secondary">
                  {answer === null
                    ? "Were these notes useful?"
                    : answer === "yes"
                      ? "Thanks, glad they helped."
                      : "Thanks, we'll make them clearer."}
                </Text>
                <Button
                  size="sm"
                  aria-pressed={answer === "yes"}
                  onClick={() => {
                    setAnswer("yes");
                  }}
                >
                  Yes
                </Button>
                <Button
                  size="sm"
                  aria-pressed={answer === "no"}
                  onClick={() => {
                    setAnswer("no");
                  }}
                >
                  No
                </Button>
              </Inline>
            </Stack>
          </article>
        </ArticleLayout>
      </Section>
    </Page>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("What's new in 2.4");
  await press("button", "Yes");
  await see("Thanks, glad they helped.");
};
