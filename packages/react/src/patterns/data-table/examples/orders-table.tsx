import { useState } from "react";
import type { ReactElement } from "react";
import { Menu } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { AppPage, DataTable, PageHeader, StatusBadge } from "@buttery/react";
import type { DataTableColumn, DataTableSort } from "@buttery/react";

interface Order {
  readonly id: string;
  readonly customer: string;
  readonly paid: boolean;
  readonly total: number;
}

const ORDERS: readonly Order[] = [
  { id: "ORD-2041", customer: "Ines Vale", paid: true, total: 42 },
  { id: "ORD-2042", customer: "Tomas Reyes", paid: false, total: 18.5 },
  { id: "ORD-2043", customer: "Mira Okafor", paid: true, total: 96 },
  { id: "ORD-2044", customer: "Lena Park", paid: true, total: 27.25 },
];

const COLUMNS: readonly DataTableColumn<Order>[] = [
  {
    id: "id",
    header: "Order",
    cell: (order) => <DataTable.Id value={order.id} />,
  },
  {
    id: "customer",
    header: "Customer",
    minWidth: "md",
    grow: 2,
    sortable: true,
    cell: (order) => order.customer,
  },
  {
    id: "status",
    header: "Status",
    skeleton: "badge",
    cell: (order) => (
      <StatusBadge tone={order.paid ? "success" : "warning"}>
        {order.paid ? "Paid" : "Unpaid"}
      </StatusBadge>
    ),
  },
  {
    id: "total",
    header: "Total",
    align: "end",
    sortable: true,
    cell: (order) => <DataTable.Amount value={order.total} currency="USD" />,
  },
];

function sorted(
  orders: readonly Order[],
  sort: DataTableSort | null,
): readonly Order[] {
  if (sort === null) return orders;
  const sign = sort.direction === "ascending" ? 1 : -1;
  return [...orders].sort((a, b) =>
    sort.column === "total"
      ? (a.total - b.total) * sign
      : a.customer.localeCompare(b.customer) * sign,
  );
}

/** An orders page: selection with a count, sortable headers and a menu of actions on each row. */
export function OrdersTable(): ReactElement {
  const [sort, setSort] = useState<DataTableSort | null>(null);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [note, setNote] = useState("No changes yet");
  return (
    <AppPage header={<PageHeader title="Orders" />}>
      <AppPage.Section
        title="This week"
        description={`${String(selected.size)} selected · ${note}`}
      >
        <DataTable
          label="Orders"
          columns={COLUMNS}
          rows={sorted(ORDERS, sort)}
          rowKey={(order) => order.id}
          rowLabel={(order) => order.id}
          selectable
          selected={selected}
          onSelectedChange={setSelected}
          sort={sort}
          onSortChange={setSort}
          rowActions={(order) => (
            <>
              <Menu.Item
                onSelect={() => {
                  setNote(`Resent the receipt for ${order.id}`);
                }}
              >
                Resend receipt
              </Menu.Item>
              <Menu.Item
                tone="danger"
                onSelect={() => {
                  setNote(`Refunded ${order.id}`);
                }}
              >
                Refund
              </Menu.Item>
            </>
          )}
        />
      </AppPage.Section>
    </AppPage>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("checkbox", "Select ORD-2042");
  await see("1 selected · No changes yet");
  await press("button", "Actions for ORD-2043");
  await press("menuitem", "Refund");
  await see("1 selected · Refunded ORD-2043");
};
