import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { ChoiceDialog, PageHeader } from "@buttery/react";
import { ShoppingBag, Store } from "lucide-react";

/** Opened from a page header's action, with open and onOpenChange kept in useState. */
export function NewFromHeader(): ReactElement {
  const [open, setOpen] = useState(false);
  const [started, setStarted] = useState<string | null>(null);
  return (
    <Stack gap={4}>
      <PageHeader
        title="Orders"
        actions={
          <PageHeader.Action
            label="New order"
            variant="primary"
            onSelect={() => {
              setOpen(true);
            }}
          />
        }
      />
      <ChoiceDialog
        open={open}
        onOpenChange={setOpen}
        title="What kind of order?"
        choices={[
          {
            id: "retail",
            icon: ShoppingBag,
            title: "Retail order",
            description: "One customer, shipped to their door.",
            onSelect: () => {
              setStarted("a retail order");
            },
          },
          {
            id: "wholesale",
            icon: Store,
            title: "Wholesale order",
            description: "Cases for a café, invoiced on terms.",
            onSelect: () => {
              setStarted("a wholesale order");
            },
          },
        ]}
      />
      <Text variant="body" tone="secondary">
        {started === null ? "No order started yet" : `Started ${started}`}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "New order");
  await press("button", /^Wholesale order/);
  await see("Started a wholesale order");
};
