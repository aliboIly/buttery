import { useState } from "react";
import type { ReactElement } from "react";
import { Divider, Inline, Pressable, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

/** A header's title and save status, split by the 24px vertical divider, with the save action at the end. */
export function HeaderSeparator(): ReactElement {
  const [saved, setSaved] = useState(false);
  return (
    <Inline gap={3} justify="between">
      <Inline gap={3}>
        <Text variant="title-sm">Spring launch</Text>
        <Divider orientation="vertical" length={6} decorative />
        <Text variant="control" tone="secondary">
          {saved ? "Saved" : "Unsaved changes"}
        </Text>
      </Inline>
      <Surface asChild level="raised" padX={4} padY={2} radius="full">
        <Pressable
          aria-disabled={saved}
          onClick={() => {
            setSaved(true);
          }}
        >
          <Text variant="button">Save</Text>
        </Pressable>
      </Surface>
    </Inline>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Unsaved changes");
  await press("button", "Save");
  await see("Saved");
};
