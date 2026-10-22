import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button } from "@buttery/react";

/** The four variants, from the page's main action to its quietest, and the three sizes. */
export function VariantsAndSizes(): ReactElement {
  const [last, setLast] = useState("Nothing yet");
  return (
    <Stack gap={4} align="start">
      <Inline gap={2} wrap>
        <Button
          variant="primary"
          onClick={() => {
            setLast("Published the card");
          }}
        >
          Publish
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setLast("Duplicated the card");
          }}
        >
          Duplicate
        </Button>
        <Button
          variant="soft"
          onClick={() => {
            setLast("Opened the preview");
          }}
        >
          Preview
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setLast("Discarded the draft");
          }}
        >
          Discard
        </Button>
      </Inline>
      <Inline gap={2} align="center" wrap>
        <Button variant="primary" size="sm">
          Small
        </Button>
        <Button variant="primary" size="md">
          Medium
        </Button>
        <Button variant="primary" size="cta" arrow="forward">
          Get started
        </Button>
      </Inline>
      <Text variant="body" tone="secondary">
        Last action: {last}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Duplicate");
  await see("Last action: Duplicated the card");
  await press("button", "Discard");
  await see("Last action: Discarded the draft");
};
