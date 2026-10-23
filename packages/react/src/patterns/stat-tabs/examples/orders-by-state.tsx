import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { StatTabs } from "@butteryui/react";

const TABS = [
  { value: "all", label: "All", count: 1284, shows: "every order" },
  {
    value: "unpaid",
    label: "Unpaid",
    count: 12,
    shows: "orders waiting on a payment",
  },
  {
    value: "roasting",
    label: "Roasting",
    count: 31,
    shows: "orders in the roaster",
  },
  {
    value: "shipped",
    label: "Shipped",
    count: 1241,
    shows: "orders on their way",
  },
];

/** Orders by state over a table: each tab says how many orders it holds, and the chosen one is kept in state. */
export function OrdersByState(): ReactElement {
  const [state, setState] = useState("all");
  const chosen = TABS.find((tab) => tab.value === state);
  return (
    <Stack gap={3}>
      <StatTabs
        label="Orders by state"
        tabs={TABS}
        value={state}
        onValueChange={setState}
      />
      <Text variant="body" tone="secondary">
        {`Showing ${chosen?.shows ?? "every order"}.`}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Showing every order.");
  await press("combobox", /^Orders by state/);
  await press("option", "Unpaid · 12");
  await see("Showing orders waiting on a payment.");
};
