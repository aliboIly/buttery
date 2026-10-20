import { Stack } from "@buttery/core";
import type { DemoSection } from "@buttery/core";
import { Switch } from "@buttery/react";

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
