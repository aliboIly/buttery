import { Download, Plus, RefreshCw, Send, Upload } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { QuickActions } from "@butteryui/react";

/** More actions than room: the lowest priority ones fold into the More quick actions menu, where they still run. */
export function NarrowShortcuts(): ReactElement {
  const [last, setLast] = useState("Nothing yet");
  return (
    <Stack gap={3} style={{ maxInlineSize: "var(--bt-w-dialog)" }}>
      <QuickActions label="Order actions">
        <QuickActions.Action
          icon={Plus}
          label="New order"
          priority={3}
          onSelect={() => {
            setLast("Started order #1046");
          }}
        />
        <QuickActions.Action
          icon={Send}
          label="Send invoices"
          priority={2}
          onSelect={() => {
            setLast("Sent 3 invoices");
          }}
        />
        <QuickActions.Action
          icon={RefreshCw}
          label="Sync stock"
          onSelect={() => {
            setLast("Stock synced");
          }}
        />
        <QuickActions.Action
          icon={Upload}
          label="Import"
          onSelect={() => {
            setLast("Imported 12 orders");
          }}
        />
        <QuickActions.Action
          icon={Download}
          label="Export"
          onSelect={() => {
            setLast("Exported 42 orders");
          }}
        />
      </QuickActions>
      <Text variant="body-sm" tone="secondary">{`Last: ${last}`}</Text>
    </Stack>
  );
}

export const kind: ExampleKind = "states";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "More quick actions");
  await press("menuitem", "Export");
  await see("Last: Exported 42 orders");
};
