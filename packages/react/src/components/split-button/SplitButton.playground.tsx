import { Clipboard, FileImage } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";
import { SplitButton } from "@buttery/react";

export const page: DocsPage = {
  section: "components/actions",
  title: "SplitButton",
  description:
    "A primary action with a menu of related ones beside it: two halves of one pill, each its own button.",
  order: 90,
  status: "stable",
  since: "0.4.0",
};

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

function LiveExport({
  label,
  disabled,
}: {
  readonly label: string;
  readonly disabled: boolean;
}): ReactElement {
  const [last, setLast] = useState("Nothing exported yet");
  return (
    <Stack gap={3} align="start">
      <SplitButton
        menuLabel="More export options"
        disabled={disabled}
        onClick={() => {
          setLast("Exported a PNG");
        }}
        items={[
          {
            label: "Export as JPG",
            onSelect: () => {
              setLast("Exported a JPG");
            },
          },
          {
            label: "Copy to clipboard",
            onSelect: () => {
              setLast("Copied the image");
            },
          },
        ]}
      >
        {label}
      </SplitButton>
      <Text variant="body-sm">{last}</Text>
    </Stack>
  );
}

export const live: LiveDemo = {
  controls: {
    children: { kind: "text", initial: "Export PNG" },
    disabled: { kind: "toggle", initial: false },
  },
  render: ({ children, disabled }) => (
    <LiveExport label={String(children)} disabled={disabled === true} />
  ),
  code: ({ children, disabled }) =>
    [
      "<SplitButton",
      '  menuLabel="More export options"',
      ...(disabled === true ? ["  disabled"] : []),
      "  onClick={exportPng}",
      "  items={[",
      '    { label: "Export as JPG", onSelect: exportJpg },',
      '    { label: "Copy to clipboard", onSelect: copyImage },',
      "  ]}",
      ">",
      `  ${String(children)}`,
      "</SplitButton>",
    ].join("\n"),
};

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
