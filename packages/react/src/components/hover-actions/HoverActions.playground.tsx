import { Stack, Text } from "@butteryui/core";
import { demoChoice } from "@butteryui/core";
import type { DemoSection, DocsPage, LiveDemo } from "@butteryui/core";
import { HoverActions, IconButton } from "@butteryui/react";
import { Settings, Trash2 } from "lucide-react";

export const page: DocsPage = {
  section: "components/data-display",
  title: "HoverActions",
  description:
    "A row whose actions show on hover and keyboard focus, with an accent bar.",
  order: 80,
  status: "new",
  since: "0.8.0",
};

const ROWS = [
  { name: "Orders waiting on payment", hint: "Emailed every morning" },
  { name: "Payouts", hint: "Emailed when a payout is sent" },
  { name: "Low green coffee", hint: "Off" },
];

const ACTIONS = ["settings", "remove", "both"] as const;

export const live: LiveDemo = {
  controls: {
    actions: { kind: "choice", options: ACTIONS, initial: "settings" },
    children: { kind: "text", initial: "Payouts" },
  },
  render: ({ actions, children }) => {
    const shown = demoChoice(actions, ACTIONS);
    const name = String(children);
    return (
      <HoverActions
        actions={
          <>
            {shown === "remove" ? null : (
              <IconButton
                icon={Settings}
                label={`Settings for ${name}`}
                size="sm"
              />
            )}
            {shown === "settings" ? null : (
              <IconButton icon={Trash2} label={`Remove ${name}`} size="sm" />
            )}
          </>
        }
      >
        <Text variant="label">{name}</Text>
      </HoverActions>
    );
  },
  code: ({ actions, children }) => {
    const shown = demoChoice(actions, ACTIONS);
    const name = String(children);
    const settings = `<IconButton icon={Settings} label="Settings for ${name}" size="sm" />`;
    const remove = `<IconButton icon={Trash2} label="Remove ${name}" size="sm" />`;
    const buttons =
      shown === "settings"
        ? settings
        : shown === "remove"
          ? remove
          : `<>${settings}${remove}</>`;
    return `<HoverActions actions={${buttons}}>
  <Text variant="label">${name}</Text>
</HoverActions>`;
  },
};

export const demos: readonly DemoSection[] = [
  {
    title: "Settings rows",
    description:
      "Point at a row, or Tab to its gear, to show its action and bar.",
    render: () => (
      <Stack gap={1}>
        {ROWS.map((row) => (
          <HoverActions
            key={row.name}
            actions={
              <IconButton
                icon={Settings}
                label={`Settings for ${row.name.toLowerCase()}`}
                size="sm"
              />
            }
          >
            <Text variant="label">{row.name}</Text>
            <Text variant="caption">{row.hint}</Text>
          </HoverActions>
        ))}
      </Stack>
    ),
  },
];
