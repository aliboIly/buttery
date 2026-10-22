import type { ReactElement } from "react";
import { CircleHelp, Copy, Download, Redo2, Share2, Undo2 } from "lucide-react";
import {
  Center,
  Icon,
  OverflowCluster,
  Pressable,
  Stack,
  Surface,
  Text,
} from "@buttery/core";
import type { DemoSection, DocsPage } from "@buttery/core";

export const page: DocsPage = {
  section: "layout",
  title: "OverflowCluster",
  description:
    'A row of actions that moves its lowest-priority items into a "More" menu instead of wrapping, overlapping or shrinking.',
  order: 170,
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
