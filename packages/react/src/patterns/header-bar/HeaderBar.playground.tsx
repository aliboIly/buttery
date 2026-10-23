import { useState } from "react";
import type { ReactElement } from "react";
import { OverflowCluster, Stack } from "@butteryui/core";
import type { DemoSection, DocsPage } from "@butteryui/core";
import { HeaderBar, IconButton, Select } from "@butteryui/react";
import type { SelectOption } from "@butteryui/react";
import { CircleHelp, Redo2, Trash2, Undo2 } from "lucide-react";

export const page: DocsPage = {
  section: "patterns",
  title: "HeaderBar",
  description:
    "An app's top bar: its mark and title, then actions that fold into a More menu when there isn't room.",
  order: 190,
  status: "stable",
  since: "0.6.0",
  home: "patterns/inspector",
};

type Shape = "16:9" | "4:3" | "1:1";

const SHAPES: readonly SelectOption<Shape>[] = [
  { value: "16:9", label: "16:9" },
  { value: "4:3", label: "4:3" },
  { value: "1:1", label: "1:1" },
];

function DemoMark(): ReactElement {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <rect width="24" height="24" rx="6" fill="var(--bt-primary)" />
      <rect
        x="6"
        y="7"
        width="12"
        height="10"
        rx="2.5"
        fill="var(--bt-on-primary)"
      />
    </svg>
  );
}

function Editor(): ReactElement {
  const [shape, setShape] = useState<Shape>("16:9");
  return (
    <HeaderBar mark={<DemoMark />} title="Quarterly review" dragRegion>
      <HeaderBar.Actions>
        <HeaderBar.Action
          label="Present"
          priority={2}
          onSelect={() => undefined}
        />
        <HeaderBar.Action label="Duplicate" onSelect={() => undefined} />
        <HeaderBar.Action
          label="Delete"
          icon={Trash2}
          iconOnly
          priority={1}
          onSelect={() => undefined}
        />
        <OverflowCluster.Item
          priority={3}
          menuItem={{
            label: `Canvas shape: ${shape}`,
            onSelect: () => {
              setShape((current) =>
                current === "16:9" ? "4:3" : current === "4:3" ? "1:1" : "16:9",
              );
            },
          }}
        >
          <Select
            label="Canvas shape"
            options={SHAPES}
            value={shape}
            onValueChange={setShape}
          />
        </OverflowCluster.Item>
      </HeaderBar.Actions>
      <HeaderBar.Separator />
      <IconButton icon={Undo2} label="Undo" />
      <IconButton icon={Redo2} label="Redo" disabled />
      <IconButton icon={CircleHelp} label="Help" />
    </HeaderBar>
  );
}

export const demos: readonly DemoSection[] = [
  {
    title: "Editor header",
    description:
      "The mark and title, text and icon actions, the canvas shape select, then undo, redo and help after a separator.",
    render: () => <Editor />,
  },
  {
    title: "When it narrows",
    description:
      "At 400px the lowest-priority actions fold into the More menu; the title keeps its words.",
    render: () => (
      <Stack style={{ maxInlineSize: "var(--bt-w-dialog)" }}>
        <Editor />
      </Stack>
    ),
  },
];
