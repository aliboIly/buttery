import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { FilterBar, FilterPill } from "@buttery/react";

interface Order {
  readonly status: "Paid" | "Unpaid";
  readonly origin: "Ethiopia" | "Kenya" | "Colombia";
  readonly daysAgo: number;
}

const ORDERS: readonly Order[] = [
  { status: "Unpaid", origin: "Ethiopia", daysAgo: 2 },
  { status: "Unpaid", origin: "Ethiopia", daysAgo: 5 },
  { status: "Unpaid", origin: "Kenya", daysAgo: 3 },
  { status: "Paid", origin: "Ethiopia", daysAgo: 1 },
  { status: "Unpaid", origin: "Colombia", daysAgo: 12 },
  { status: "Paid", origin: "Kenya", daysAgo: 20 },
  { status: "Unpaid", origin: "Ethiopia", daysAgo: 30 },
  { status: "Paid", origin: "Colombia", daysAgo: 4 },
];

/** Several filters applied at once: the pills wrap, each one removable, and Clear filters takes them all away. */
export function AppliedFilters(): ReactElement {
  const [status, setStatus] = useState<string | undefined>("Unpaid");
  const [origin, setOrigin] = useState<string | undefined>("Ethiopia");
  const [placed, setPlaced] = useState<string | undefined>("Last 7 days");
  const shown = ORDERS.filter(
    (order) =>
      (status === undefined || order.status === status) &&
      (origin === undefined || order.origin === origin) &&
      (placed === undefined || order.daysAgo <= 7),
  );
  return (
    <Stack gap={4}>
      <FilterBar
        onClearAll={() => {
          setStatus(undefined);
          setOrigin(undefined);
          setPlaced(undefined);
        }}
      >
        <FilterPill
          label="Status"
          value={status}
          onRemove={() => {
            setStatus(undefined);
          }}
        >
          <Text variant="body-sm">Paid or unpaid</Text>
        </FilterPill>
        <FilterPill
          label="Origin"
          value={origin}
          onRemove={() => {
            setOrigin(undefined);
          }}
        >
          <Text variant="body-sm">Where the coffee was grown</Text>
        </FilterPill>
        <FilterPill
          label="Placed"
          value={placed}
          onRemove={() => {
            setPlaced(undefined);
          }}
        >
          <Text variant="body-sm">When the order came in</Text>
        </FilterPill>
        <FilterPill label="Customer">
          <Text variant="body-sm">Search customers</Text>
        </FilterPill>
      </FilterBar>
      <Text variant="label">{`Showing ${String(shown.length)} of ${String(ORDERS.length)} orders`}</Text>
    </Stack>
  );
}

export const kind: ExampleKind = "states";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Showing 2 of 8 orders");
  await press("button", "Filters · 3");
  await press("button", "Remove Origin");
  await see("Showing 3 of 8 orders");
  await press("button", "Clear filters");
  await see("Showing 8 of 8 orders");
};
