import { useState } from "react";
import type { ReactElement } from "react";
import {
  AppPage,
  DataTable,
  FilterBar,
  FilterPill,
  PageHeader,
  SearchField,
  SegmentedControl,
  StatusBadge,
  matchesSearch,
  toast,
} from "@buttery/react";
import type {
  DataTableColumn,
  DataTableSort,
  StatusTone,
} from "@buttery/react";
import { Download } from "lucide-react";
import { shortDate } from "../data.ts";
import type { Order, OrderStatus } from "../data.ts";

const STATUSES: Readonly<
  Record<OrderStatus, { readonly label: string; readonly tone: StatusTone }>
> = {
  unpaid: { label: "Unpaid", tone: "warning" },
  paid: { label: "Paid", tone: "info" },
  shipped: { label: "Shipped", tone: "success" },
  refunded: { label: "Refunded", tone: "danger" },
};

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "unpaid", label: "Unpaid" },
  { value: "paid", label: "Paid" },
  { value: "shipped", label: "Shipped" },
  { value: "refunded", label: "Refunded" },
] as const satisfies readonly {
  value: OrderStatus | "all";
  label: string;
}[];

const COLUMNS: readonly DataTableColumn<Order>[] = [
  {
    id: "order",
    header: "Order",
    cell: (order) => <DataTable.Id value={order.id} />,
    minWidth: "sm",
  },
  {
    id: "customer",
    header: "Customer",
    cell: (order) => order.customer,
    minWidth: "md",
    grow: 2,
  },
  {
    id: "item",
    header: "Item",
    cell: (order) => order.item,
    minWidth: "md",
    grow: 2,
  },
  {
    id: "amount",
    header: "Amount",
    cell: (order) => <DataTable.Amount value={order.amount} currency="USD" />,
    minWidth: "sm",
    align: "end",
    sortable: true,
  },
  {
    id: "status",
    header: "Status",
    cell: (order) => (
      <StatusBadge tone={STATUSES[order.status].tone}>
        {STATUSES[order.status].label}
      </StatusBadge>
    ),
    minWidth: "sm",
    skeleton: "badge",
  },
  {
    id: "placed",
    header: "Placed",
    cell: (order) => shortDate(order.placed),
    minWidth: "sm",
    sortable: true,
  },
];

function compare(sort: DataTableSort | null): (a: Order, b: Order) => number {
  const direction = sort?.direction === "ascending" ? 1 : -1;
  switch (sort?.column ?? "placed") {
    case "amount":
      return (a, b) => (a.amount - b.amount) * direction;
    default:
      return (a, b) =>
        (a.placed.localeCompare(b.placed) || a.id.localeCompare(b.id)) *
        direction;
  }
}

/** Every order in a table: filtered by status, searched by customer or item, sorted by a column. */
export function OrdersPage({
  orders,
}: {
  readonly orders: readonly Order[];
}): ReactElement {
  const [status, setStatus] = useState<OrderStatus | undefined>(undefined);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<DataTableSort | null>({
    column: "placed",
    direction: "descending",
  });
  const shown = orders
    .filter(
      (order) =>
        (status === undefined || order.status === status) &&
        (query.trim() === "" ||
          matchesSearch(query, order.id, order.customer, order.item)),
    )
    .sort(compare(sort));
  const clearAll = (): void => {
    setStatus(undefined);
    setQuery("");
  };
  return (
    <AppPage
      fill
      header={
        <PageHeader
          title="Orders"
          description="Every order from the shop, newest first."
          actions={
            <PageHeader.Action
              label="Export"
              icon={Download}
              onSelect={() => {
                toast(
                  `Exported ${String(shown.length)} ${shown.length === 1 ? "order" : "orders"} to orders.csv`,
                );
              }}
            />
          }
        />
      }
    >
      <AppPage.Section>
        <FilterBar
          onClearAll={status === undefined ? undefined : clearAll}
          actions={
            <SearchField
              label="Search orders"
              placeholder="Customer or item"
              variant="outline"
              value={query}
              onValueChange={setQuery}
            />
          }
        >
          <FilterPill
            label="Status"
            value={status === undefined ? undefined : STATUSES[status].label}
            onRemove={
              status === undefined
                ? undefined
                : () => {
                    setStatus(undefined);
                  }
            }
          >
            <SegmentedControl<OrderStatus | "all">
              label="Status"
              options={STATUS_OPTIONS}
              value={status ?? "all"}
              onValueChange={(next) => {
                setStatus(next === "all" ? undefined : next);
              }}
            />
          </FilterPill>
        </FilterBar>
        <DataTable<Order>
          label="Orders"
          columns={COLUMNS}
          rows={shown}
          rowKey={(order) => order.id}
          rowLabel={(order) => `Order ${order.id}`}
          sort={sort}
          onSortChange={setSort}
          onClearAll={clearAll}
        />
      </AppPage.Section>
    </AppPage>
  );
}
