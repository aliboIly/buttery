import { Clipboard, FileImage } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { DemoSection } from "@buttery/core";
import { SplitButton } from "@buttery/react";

function ExportDemo(): ReactElement {
  const [last, setLast] = useState("Nothing yet");
  return (
    <Stack gap={3} align="start">
      <SplitButton
        menuLabel="More export options"
        onClick={() => {
          setLast("Exported a PNG");
        }}
        items={[
          {
            label: "Export as JPG",
            icon: FileImage,
            onSelect: () => {
              setLast("Exported a JPG");
            },
          },
          {
            label: "Copy to clipboard",
            icon: Clipboard,
            onSelect: () => {
              setLast("Copied the image");
            },
          },
        ]}
      >
        Export PNG
      </SplitButton>
      <Text variant="body-sm">{last}</Text>
    </Stack>
  );
}

export const demos: readonly DemoSection[] = [
  {
    title: "Main action and alternatives",
    description:
      "Each half is its own button: Tab moves between them, and the chevron opens the menu.",
    render: () => <ExportDemo />,
  },
  {
    title: "Disabled",
    render: () => (
      <SplitButton
        disabled
        menuLabel="More export options"
        items={[{ label: "Export as JPG", onSelect: () => undefined }]}
      >
        Export PNG
      </SplitButton>
    ),
  },
];
