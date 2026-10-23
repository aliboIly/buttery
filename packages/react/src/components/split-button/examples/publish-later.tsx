import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { SplitButton, TextField } from "@buttery/react";

/** Publish now, or pick a later time from the menu: both halves stay disabled until the deck has a title, and one entry is unavailable. */
export function PublishLater(): ReactElement {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("Draft");
  const named = title.trim() !== "";
  return (
    <Stack gap={3} align="start">
      <TextField label="Deck title" value={title} onValueChange={setTitle} />
      <SplitButton
        disabled={!named}
        menuLabel="More ways to publish"
        onClick={() => {
          setStatus(`Published ${title}`);
        }}
        items={[
          {
            label: "Publish tomorrow at 9:00",
            onSelect: () => {
              setStatus(`${title} goes out tomorrow at 9:00`);
            },
          },
          {
            label: "Publish to a group",
            onSelect: () => undefined,
            disabled: true,
          },
        ]}
      >
        Publish
      </SplitButton>
      <Text variant="body" tone="secondary">
        {status}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "states";

export const play: ExamplePlay = async ({ press, type, see }) => {
  await type("Deck title", "Spring launch");
  await press("button", "More ways to publish");
  await press("menuitem", "Publish tomorrow at 9:00");
  await see("Spring launch goes out tomorrow at 9:00");
};
