import { Stack } from "@buttery/core";
import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";
import { Switch } from "@buttery/react";

export const page: DocsPage = {
  section: "components/selection",
  title: "Switch",
  description:
    "A switch that turns a setting on or off at once, with its label beside it.",
  order: 110,
  status: "stable",
  since: "0.5.0",
};

export const live: LiveDemo = {
  controls: {
    label: { kind: "text", initial: "Snap to the grid" },
    hint: {
      kind: "text",
      initial: "Text on the gift card lines up as you drag it.",
    },
    defaultChecked: { kind: "toggle", initial: true },
    disabled: { kind: "toggle", initial: false },
  },
  render: ({ label, hint, defaultChecked, disabled }) => (
    <Switch
      key={String(defaultChecked)}
      label={String(label)}
      hint={String(hint)}
      defaultChecked={defaultChecked === true}
      disabled={disabled === true}
    />
  ),
};

export const demos: readonly DemoSection[] = [
  {
    title: "States",
    description:
      "Off, on, with a hint, and disabled off and on. The thumb glides across on spring.snappy.",
    render: () => (
      <Stack gap={4}>
        <Switch label="Snap to the grid" />
        <Switch label="Show guides" defaultChecked />
        <Switch
          label="Sync to the cloud"
          hint="Orders and stock back up as you work."
        />
        <Switch label="Share with the team" disabled />
        <Switch label="Keep a backup" disabled defaultChecked />
      </Stack>
    ),
  },
];
