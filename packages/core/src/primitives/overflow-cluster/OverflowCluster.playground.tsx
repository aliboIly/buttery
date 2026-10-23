import { useState } from "react";
import type { ReactElement } from "react";
import { CircleHelp, Copy, Download, Redo2, Share2, Undo2 } from "lucide-react";
import {
  Center,
  Control,
  Icon,
  OverflowCluster,
  Pressable,
  Stack,
  Surface,
  Text,
} from "@butteryui/core";
import { demoChoice } from "@butteryui/core";
import type { DemoSection, DocsPage, LiveDemo } from "@butteryui/core";

export const page: DocsPage = {
  section: "layout",
  title: "OverflowCluster",
  description:
    'A row of actions that moves its lowest-priority items into a "More" menu instead of wrapping, overlapping or shrinking.',
  order: 60,
  status: "stable",
  since: "0.2.0",
};

const ACTIONS = [
  { label: "Undo", icon: Undo2, priority: 5 },
  { label: "Redo", icon: Redo2, priority: 5 },
  { label: "Copy", icon: Copy, priority: 3 },
  { label: "Download", icon: Download, priority: 2 },
  { label: "Share", icon: Share2, priority: 1 },
  { label: "Help", icon: CircleHelp, priority: 0 },
] as const;

function Cluster(): ReactElement {
  return (
    <OverflowCluster gap={1} moreLabel="More actions">
      {ACTIONS.map(({ label, icon, priority }) => (
        <OverflowCluster.Item
          key={label}
          priority={priority}
          menuItem={{ label, icon, onSelect: () => undefined }}
        >
          <Surface
            asChild
            level="raised"
            radius="full"
            style={{
              inlineSize: "var(--bt-h-button)",
              blockSize: "var(--bt-h-button)",
            }}
          >
            <Center asChild>
              <Pressable aria-label={label} title={label}>
                <Icon icon={icon} />
              </Pressable>
            </Center>
          </Surface>
        </OverflowCluster.Item>
      ))}
    </OverflowCluster>
  );
}

const WIDTHS = [
  { width: "var(--bt-w-dialog)", label: "Wide, 400px" },
  { width: "var(--bt-w-row-control)", label: "Medium, 160px" },
  { width: "var(--bt-space-32)", label: "Narrow, 128px" },
] as const;

const TOOLS = [
  "Crop",
  "Rotate",
  "Flip",
  "Straighten",
  "Resize",
  "Remove background",
] as const;

type ClusterSize = "button" | "sm" | "control";

function sizeOf(value: unknown): ClusterSize {
  return demoChoice(value, ["button", "sm", "control"]);
}

function justifyOf(value: unknown): "start" | "end" {
  return demoChoice(value, ["start", "end"]);
}

function gapOf(value: unknown): "1" | "2" | "3" {
  return demoChoice(value, ["1", "2", "3"]);
}

function LiveCluster({
  size,
  justify,
  gap,
}: {
  readonly size: ClusterSize;
  readonly justify: "start" | "end";
  readonly gap: "1" | "2" | "3";
}): ReactElement {
  const [last, setLast] = useState("None yet");
  return (
    <Stack gap={3}>
      <Surface
        level="card"
        pad={2}
        style={{ inlineSize: "var(--bt-w-dialog)", maxInlineSize: "100%" }}
      >
        <OverflowCluster
          size={size}
          justify={justify}
          gap={gap}
          moreLabel="More tools"
        >
          {TOOLS.map((tool, index) => (
            <OverflowCluster.Item
              key={tool}
              priority={TOOLS.length - index}
              menuItem={{
                label: tool,
                onSelect: () => {
                  setLast(tool);
                },
              }}
            >
              <Surface asChild level="raised" radius="full">
                <Control size={size} asChild>
                  <Pressable
                    onClick={() => {
                      setLast(tool);
                    }}
                  >
                    <Text variant="button">{tool}</Text>
                  </Pressable>
                </Control>
              </Surface>
            </OverflowCluster.Item>
          ))}
        </OverflowCluster>
      </Surface>
      <Text variant="caption">Last tool: {last}</Text>
    </Stack>
  );
}

export const live: LiveDemo = {
  controls: {
    size: {
      kind: "choice",
      options: ["sm", "control", "button"],
      initial: "button",
    },
    justify: { kind: "choice", options: ["start", "end"], initial: "start" },
    gap: { kind: "choice", options: ["1", "2", "3"], initial: "1" },
  },
  render: ({ size, justify, gap }) => (
    <LiveCluster
      size={sizeOf(size)}
      justify={justifyOf(justify)}
      gap={gapOf(gap)}
    />
  ),
  code: ({ size, justify, gap }) =>
    [
      `<OverflowCluster size="${sizeOf(size)}" justify="${justifyOf(justify)}" gap={${gapOf(gap)}} moreLabel="More tools">`,
      "  {tools.map((tool, index) => (",
      "    <OverflowCluster.Item",
      "      key={tool}",
      "      priority={tools.length - index}",
      "      menuItem={{ label: tool, onSelect: () => setLast(tool) }}",
      "    >",
      '      <Surface asChild level="raised" radius="full">',
      `        <Control size="${sizeOf(size)}" asChild>`,
      "          <Pressable onClick={() => setLast(tool)}>{tool}</Pressable>",
      "        </Control>",
      "      </Surface>",
      "    </OverflowCluster.Item>",
      "  ))}",
      "</OverflowCluster>",
    ].join("\n"),
};

export const demos: readonly DemoSection[] = [
  {
    title: "Collapsing by priority",
    description:
      "The same six actions at three widths. Help goes first, then Share and Download; Undo and Redo stay longest.",
    render: () => (
      <Stack gap={4}>
        {WIDTHS.map(({ width, label }) => (
          <Stack key={width} gap={2}>
            <Text variant="caption">{label}</Text>
            <Surface
              level="card"
              padX={2}
              padY={2}
              style={{
                inlineSize: width,
                maxInlineSize: "100%",
                display: "flex",
              }}
            >
              <Cluster />
            </Surface>
          </Stack>
        ))}
      </Stack>
    ),
  },
];
