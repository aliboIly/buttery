import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { Stack } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { DataTable, SearchField } from "@buttery/react";

interface Order {
  readonly id: string;
  readonly customer: string;
}

const ORDERS: readonly Order[] = [
  { id: "ORD-2041", customer: "Ines Vale" },
  { id: "ORD-2042", customer: "Tomas Reyes" },
  { id: "ORD-2043", customer: "Mira Okafor" },
];

/** Skeleton rows while the orders load, then a row with Clear all when a search leaves none. */
export function OrdersThatLoad(): ReactElement {
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const words = query.trim().toLowerCase();
  const rows = ORDERS.filter((order) =>
    order.customer.toLowerCase().includes(words),
  );
  return (
    <Stack gap={3}>
      <SearchField
        label="Search orders"
        value={query}
        onValueChange={setQuery}
      />
      <DataTable
        label="Orders"
        loading={loading}
        columns={[
          { id: "id", header: "Order", cell: (order) => order.id },
          {
            id: "customer",
            header: "Customer",
            minWidth: "md",
            grow: 2,
            cell: (order) => order.customer,
          },
        ]}
        rows={rows}
        rowKey={(order) => order.id}
        onClearAll={() => {
          setQuery("");
        }}
      />
    </Stack>
  );
}

export const kind: ExampleKind = "states";

export const play: ExamplePlay = async ({ press, type, see }) => {
  await see("Mira Okafor");
  await type("Search orders", "zz");
  await see("No results");
  await press("button", "Clear all");
  await see("Mira Okafor");
};
