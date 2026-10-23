import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Surface } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import {
  CommandSearch,
  PageHeader,
  TopBar,
  matchesSearch,
} from "@buttery/react";
import type { LocalSearchSource } from "@buttery/react";

interface Order {
  readonly id: string;
  readonly customer: string;
  readonly total: string;
}

const ORDERS: readonly Order[] = [
  { id: "1042", customer: "Ines Vale", total: "$38.00" },
  { id: "1043", customer: "Oskar Lind", total: "$64.00" },
  { id: "1044", customer: "Mira Okafor", total: "$21.50" },
];

/** The app's search in its top bar: finding an order opens it on the page under the bar. */
export function TopBarSearch(): ReactElement {
  const [opened, setOpened] = useState<Order | null>(null);
  const orders: LocalSearchSource = {
    id: "orders",
    label: "Orders",
    search: (query) =>
      ORDERS.filter((order) =>
        matchesSearch(query.text, order.id, order.customer),
      ).map((order) => ({
        id: order.id,
        label: `Order ${order.id}`,
        detail: order.customer,
        onSelect: () => {
          setOpened(order);
        },
      })),
  };
  return (
    <Stack gap={4}>
      <Surface level="card">
        <TopBar
          search={<CommandSearch label="Search orders" sources={[orders]} />}
        />
      </Surface>
      <PageHeader
        title={opened === null ? "Orders" : `Order ${opened.id}`}
        description={
          opened === null
            ? "Search for an order to open it here."
            : `${opened.customer}, ${opened.total}`
        }
      />
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, type, see }) => {
  await press("combobox", "Search orders");
  await type("Search orders", "oskar");
  await press("option", /^Order 1043/);
  await see("Oskar Lind, $64.00");
};
