import { Download, Plus } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { PageHeader } from "@buttery/react";

/** An orders page's header: the count after the title, and New order as the main action with its key, N. */
export function OrdersHeader(): ReactElement {
  const [last, setLast] = useState("Nothing yet");
  const [next, setNext] = useState(1285);
  return (
    <Stack gap={4}>
      <PageHeader
        title="Orders"
        value="1,284"
        valueInfo="Orders placed in the last 30 days."
        actions={
          <>
            <PageHeader.Action
              icon={Download}
              label="Export"
              onSelect={() => {
                setLast("Exported 1,284 orders");
              }}
            />
            <PageHeader.Action
              variant="primary"
              icon={Plus}
              label="New order"
              shortcut="n"
              priority={1}
              onSelect={() => {
                setLast(`Started order #${String(next)}`);
                setNext(next + 1);
              }}
            />
          </>
        }
      />
      <Text variant="body-sm" tone="secondary">{`Last: ${last}`}</Text>
    </Stack>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, key, see }) => {
  await press("button", "New order");
  await see("Last: Started order #1285");
  await key("n");
  await see("Last: Started order #1286");
};
