import { useState } from "react";
import type { ReactElement } from "react";
import { Menu } from "@buttery/core";
import { DataTable, StatusBadge } from "@buttery/react";
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

/** Orders with selection, sortable headers and a menu of actions on each row. */
export function OrdersTable(): ReactElement {
  const [sort, setSort] = useState<DataTableSort | null>(null);
  return (
    <DataTable
      label="Orders"
      columns={COLUMNS}
      rows={sorted(ORDERS, sort)}
      rowKey={(order) => order.id}
      rowLabel={(order) => order.id}
      selectable
      sort={sort}
      onSortChange={setSort}
      rowActions={() => (
        <>
          <Menu.Item>Resend receipt</Menu.Item>
          <Menu.Item>Refund</Menu.Item>
        </>
      )}
    />
  );
}
