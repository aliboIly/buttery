import { Stack, Text } from "@buttery/core";
import type {
  DemoSection,
  DemoValues,
  DocsPage,
  LiveDemo,
} from "@buttery/core";
import { QuickActions } from "@buttery/react";
import { Download, Plus, Send, Upload } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";

export const page: DocsPage = {
  section: "components/actions",
  title: "QuickActions",
  description:
    "A row of small soft buttons for the things people do most on a page, folding into a menu when they don't fit.",
  order: 80,
  status: "new",
  since: "0.8.0",
};

function LiveQuickActions({
  label,
  disabled,
  icons,
}: {
  readonly label: string;
  readonly disabled: boolean;
  readonly icons: boolean;
}): ReactElement {
  const [last, setLast] = useState("Nothing yet");
  return (
    <Stack gap={3}>
      <QuickActions>
        <QuickActions.Action
          icon={icons ? Plus : undefined}
          label={label}
          priority={2}
          onSelect={() => {
            setLast(label);
          }}
        />
        <QuickActions.Action
          icon={icons ? Send : undefined}
          label="Send invoices"
          disabled={disabled}
          priority={1}
          onSelect={() => {
            setLast("Send invoices");
          }}
        />
        <QuickActions.Action
          icon={icons ? Download : undefined}
          label="Export"
          onSelect={() => {
            setLast("Export");
          }}
        />
      </QuickActions>
      <Text variant="caption">{`Last pressed: ${last}`}</Text>
    </Stack>
  );
}

function quickActionsCode({ label, disabled, icons }: DemoValues): string {
  const icon = (name: string): string =>
    icons === true ? ` icon={${name}}` : "";
  return [
    "<QuickActions>",
    `  <QuickActions.Action${icon("Plus")} label="${String(label)}" priority={2} onSelect={newOrder} />`,
    `  <QuickActions.Action${icon("Send")} label="Send invoices"${disabled === true ? " disabled" : ""} priority={1} onSelect={sendInvoices} />`,
    `  <QuickActions.Action${icon("Download")} label="Export" onSelect={exportOrders} />`,
    "</QuickActions>",
  ].join("\n");
}

export const live: LiveDemo = {
  controls: {
    label: { kind: "text", initial: "New order" },
    disabled: { kind: "toggle", initial: false },
    icons: { kind: "toggle", initial: true },
  },
  render: ({ label, disabled, icons }) => (
    <LiveQuickActions
      label={String(label)}
      disabled={disabled === true}
      icons={icons === true}
    />
  ),
  code: quickActionsCode,
};

export const demos: readonly DemoSection[] = [
  {
    title: "Quick actions",
    description:
      "Small soft buttons 8px apart; narrow the page and the lowest priority ones fold into the … menu.",
    render: () => (
      <QuickActions>
        <QuickActions.Action
          icon={Plus}
          label="New order"
          priority={3}
          onSelect={() => undefined}
        />
        <QuickActions.Action
          icon={Send}
          label="Send invoices"
          priority={2}
          onSelect={() => undefined}
        />
        <QuickActions.Action
          icon={Upload}
          label="Import"
          onSelect={() => undefined}
        />
        <QuickActions.Action
          icon={Download}
          label="Export"
          onSelect={() => undefined}
        />
      </QuickActions>
    ),
  },
];
