import { Stack } from "@buttery/core";
import type { DemoSection, DocsPage } from "@buttery/core";
import { Switch } from "@buttery/react";

export const page: DocsPage = {
  section: "components/selection",
  title: "Switch",
  description:
    "A switch that turns a setting on or off at once, with its label beside it.",
  order: 110,
  status: "stable",
  since: "0.4.5",
};

export const demos: readonly DemoSection[] = [
  {
    title: "States",
    description:
      "Off, on, with a hint, and disabled off and on. The thumb slides on spring.snappy.",
    render: () => (
      <Stack gap={4}>
        <Switch label="Snap to the grid" />
        <Switch label="Show guides" defaultChecked />
        <Switch
          label="Sync to the cloud"
          hint="Your cards back up as you work."
        />
        <Switch label="Share with the team" disabled />
        <Switch label="Keep a backup" disabled defaultChecked />
      </Stack>
    ),
  },
];
