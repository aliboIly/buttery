import { Download, Plus, Send } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { QuickActions } from "@butteryui/react";

/** The few things people do most on an orders page, in one row of small soft buttons. */
export function OrderShortcuts(): ReactElement {
  const [last, setLast] = useState("Nothing yet");
  return (
    <Stack gap={3}>
      <QuickActions>
        <QuickActions.Action
          icon={Plus}
          label="New order"
          priority={2}
          onSelect={() => {
            setLast("Started order #1046");
          }}
        />
        <QuickActions.Action
          icon={Send}
          label="Send invoices"
          onSelect={() => {
            setLast("Sent 3 invoices");
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

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Send invoices");
  await see("Last: Sent 3 invoices");
};
