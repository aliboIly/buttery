import type { ReactElement } from "react";
import { CircleHelp, Copy, Download, Redo2, Share2, Undo2 } from "lucide-react";
import {
  Icon,
  OverflowCluster,
  Pressable,
  Stack,
  Surface,
  Text,
} from "@buttery/core";
import type { DemoSection } from "@buttery/core";

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
          <Pressable aria-label={label} title={label}>
            <Surface level="raised" padX={3} padY={2} radius="full">
              <Icon icon={icon} />
            </Surface>
          </Pressable>
        </OverflowCluster.Item>
      ))}
    </OverflowCluster>
  );
}

const WIDTHS = [
  "var(--bt-w-dialog)",
  "var(--bt-w-row-control)",
  "var(--bt-space-32)",
] as const;

export const demos: readonly DemoSection[] = [
  {
    title: "Collapsing by priority",
    description:
      "The same six actions at three widths. Help goes first, then Share and Download; Undo and Redo stay longest.",
    render: () => (
      <Stack gap={4} align="start">
        {WIDTHS.map((width) => (
          <Stack key={width} gap={2}>
            <Text variant="caption">{width}</Text>
            <Surface
              level="card"
              padX={2}
              padY={2}
              style={{ inlineSize: width, display: "flex" }}
            >
              <Cluster />
            </Surface>
          </Stack>
        ))}
      </Stack>
    ),
  },
];
