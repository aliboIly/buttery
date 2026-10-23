import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { SplitButton } from "@butteryui/react";

/** Export as the main action, with other formats in the menu. */
export function ExportOptions(): ReactElement {
  const [last, setLast] = useState("Nothing exported yet");
  return (
    <Stack gap={3} align="start">
      <SplitButton
        menuLabel="More export options"
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
            label: "Export as WebP",
            onSelect: () => {
              setLast("Exported title-slide.webp");
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
      <Text variant="body" tone="secondary">
        {last}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Export PNG");
  await see("Exported title-slide.png");
  await press("button", "More export options");
  await press("menuitem", "Export as WebP");
  await see("Exported title-slide.webp");
};
