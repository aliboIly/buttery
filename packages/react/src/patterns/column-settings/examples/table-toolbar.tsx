import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { ColumnSettings, DataTable, SearchField } from "@buttery/react";
import type { ColumnLayout, DataTableColumn } from "@buttery/react";

interface Customer {
  readonly name: string;
  readonly email: string;
  readonly orders: number;
}

const CUSTOMERS: readonly Customer[] = [
  { name: "Ines Vale", email: "ines@example.com", orders: 14 },
  { name: "Oskar Lind", email: "oskar@example.com", orders: 6 },
  { name: "Mira Okafor", email: "mira@example.com", orders: 21 },
];

const COLUMNS: readonly DataTableColumn<Customer>[] = [
  {
    id: "name",
    header: "Customer",
    cell: (customer) => customer.name,
    minWidth: "md",
  },
  {
    id: "email",
    header: "Email",
    cell: (customer) => customer.email,
    minWidth: "lg",
  },
  {
    id: "orders",
    header: "Orders",
    cell: (customer) => customer.orders,
    align: "end",
  },
];

/** A customers table with its toolbar: search on one side, and column settings the table's columns follow. */
export function TableToolbar(): ReactElement {
  const [query, setQuery] = useState("");
  const [layout, setLayout] = useState<ColumnLayout>({
    order: COLUMNS.map((column) => column.id),
    visible: new Set(["name", "orders"]),
  });
  const columns = layout.order
    .filter((id) => layout.visible.has(id))
    .flatMap((id) => COLUMNS.filter((column) => column.id === id));
  const words = query.trim().toLowerCase();
  const rows = CUSTOMERS.filter((customer) =>
    customer.name.toLowerCase().includes(words),
  );
  return (
    <Stack gap={3}>
      <Inline gap={3} align="center">
        <SearchField
          label="Search customers"
          value={query}
          onValueChange={setQuery}
        />
        <ColumnSettings
          columns={COLUMNS.map((column) => ({
            id: column.id,
            label: column.header,
          }))}
          layout={layout}
          onLayoutChange={setLayout}
        />
      </Inline>
      <DataTable
        label="Customers"
        columns={columns}
        rows={rows}
        rowKey={(customer) => customer.email}
        rowLabel={(customer) => customer.name}
      />
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, type, see }) => {
  await press("button", "Columns");
  await press("checkbox", "Email");
  await see("ines@example.com");
  await type("Search customers", "oskar");
  await see("oskar@example.com");
};
