import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, SplitButton } from "@butteryui/react";

/** The menu's open state kept in the example, so a tip can open it to point out a new entry. */
export function ShowNewOption(): ReactElement {
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState("Nothing exported yet");
  return (
    <Stack gap={3} align="start">
      <SplitButton
        menuLabel="More export options"
        open={open}
        onOpenChange={setOpen}
        onClick={() => {
          setLast("Exported title-slide.png");
        }}
        items={[
          {
            label: "Export as JPG",
            onSelect: () => {
              setLast("Exported title-slide.jpg");
            },
          },
          {
            label: "Copy to clipboard",
            onSelect: () => {
              setLast("Copied the slide");
            },
          },
        ]}
      >
        Export PNG
      </SplitButton>
      <Inline gap={2} align="center">
        <Text variant="body" tone="secondary">
          New: copy to the clipboard.
        </Text>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setOpen(true);
          }}
        >
          Show me
        </Button>
      </Inline>
      <Text variant="body" tone="secondary">
        {last}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Show me");
  await press("menuitem", "Copy to clipboard");
  await see("Copied the slide");
};
