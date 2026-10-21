import { Menu } from "@buttery/core";
import {
  AppPage,
  ColumnSettings,
  DataTable,
  FilterBar,
  FilterPill,
  PageHeader,
  SearchField,
  SegmentedControl,
  StatTabs,
  StatusBadge,
  toast,
} from "@buttery/react";
import type {
  ColumnLayout,
  DataTableColumn,
  DataTableSort,
  StatusTone,
} from "@buttery/react";
import { Download } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import { customerCell } from "./customer-cell.tsx";
import { ORDERS, coffeeOf, customerOf } from "./data.ts";
import type { Order, OrderStatus } from "./data.ts";
import { dateTime } from "./format.ts";
import { go } from "./navigation.ts";

const PAGE_SIZE = 25;

const STATUSES: Readonly<
  Record<OrderStatus, { readonly label: string; readonly tone: StatusTone }>
> = {
  unpaid: { label: "Unpaid", tone: "warning" },
  paid: { label: "Paid", tone: "info" },
  roasting: { label: "Roasting", tone: "neutral" },
  shipped: { label: "Shipped", tone: "success" },
  refunded: { label: "Refunded", tone: "danger" },
};

const CHANNELS = [
  { value: "web", label: "Web" },
  { value: "wholesale", label: "Wholesale" },
  { value: "subscription", label: "Subscription" },
] as const satisfies readonly { value: Order["channel"]; label: string }[];

const COLUMNS: readonly DataTableColumn<Order>[] = [
  {
    id: "order",
    header: "Order",
    cell: (order) => <DataTable.Id value={order.id} />,
    minWidth: "md",
  },
  {
    id: "customer",
    header: "Customer",
    cell: (order) => customerCell(order.customerId),
    minWidth: "md",
    grow: 2,
  },
  {
    id: "coffee",
    header: "Coffee",
    cell: (order) => coffeeOf(order.coffeeId).name,
    minWidth: "md",
    grow: 2,
  },
  {
    id: "bags",
    header: "Bags",
    cell: (order) => order.bags,
    minWidth: "sm",
    align: "end",
    sortable: true,
  },
  {
    id: "amount",
    header: "Amount",
    cell: (order) => <DataTable.Amount value={order.amount} currency="USD" />,
    minWidth: "md",
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
    cell: (order) => dateTime(order.placed),
    minWidth: "md",
    sortable: true,
  },
];

const COLUMN_SETTINGS = COLUMNS.map((column) => ({
  id: column.id,
  label: column.header,
}));

function compare(sort: DataTableSort | null): (a: Order, b: Order) => number {
  const direction = sort?.direction === "ascending" ? 1 : -1;
  switch (sort?.column ?? "placed") {
    case "bags":
      return (a, b) => (a.bags - b.bags) * direction;
    case "amount":
      return (a, b) => (a.amount - b.amount) * direction;
    default:
      return (a, b) => (a.placed.getTime() - b.placed.getTime()) * direction;
  }
}

/** Every order, by state, with filters, a search and the columns people choose. */
export function OrdersPage({
  onNewOrder,
}: {
  readonly onNewOrder: () => void;
}): ReactElement {
  const [state, setState] = useState<string>("all");
  const [channel, setChannel] = useState<Order["channel"] | undefined>(
    undefined,
  );
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<DataTableSort | null>({
    column: "placed",
    direction: "descending",
  });
  const [page, setPage] = useState(1);
  const [layout, setLayout] = useState<ColumnLayout>({
    order: COLUMNS.map((column) => column.id),
    visible: new Set(COLUMNS.map((column) => column.id)),
  });
  const search = query.trim().toLowerCase();
  const matching = ORDERS.filter(
    (order) =>
      (state === "all" || order.status === state) &&
      (channel === undefined || order.channel === channel) &&
      (search === "" ||
        order.id.toLowerCase().includes(search) ||
        (customerOf(order.customerId)?.name.toLowerCase().includes(search) ??
          false)),
  ).sort(compare(sort));
  const shown = matching.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const columns = layout.order
    .filter((id) => layout.visible.has(id))
    .flatMap((id) => COLUMNS.filter((column) => column.id === id));
  const count = (status: OrderStatus): number =>
    ORDERS.filter((order) => order.status === status).length;
  const clearAll = (): void => {
    setState("all");
    setChannel(undefined);
    setQuery("");
    setPage(1);
  };
  return (
    <AppPage
      fill
      header={
        <PageHeader
          title="Orders"
          actions={
            <>
              <PageHeader.Action
                label="Export"
                icon={Download}
                onSelect={() => {
                  toast(
                    `Exported ${String(matching.length)} orders to orders.csv`,
                  );
                }}
              />
              <PageHeader.Action
                label="New order"
                variant="primary"
                shortcut="n"
                priority={1}
                onSelect={onNewOrder}
              />
            </>
          }
        />
      }
    >
      <AppPage.Section>
        <StatTabs
          label="Orders by state"
          value={state}
          onValueChange={(next) => {
            setState(next);
            setPage(1);
          }}
          tabs={[
            { value: "all", label: "All", count: ORDERS.length },
            { value: "unpaid", label: "Unpaid", count: count("unpaid") },
            { value: "roasting", label: "Roasting", count: count("roasting") },
            { value: "shipped", label: "Shipped", count: count("shipped") },
            { value: "refunded", label: "Refunded", count: count("refunded") },
          ]}
        />
        <FilterBar
          onClearAll={channel === undefined ? undefined : clearAll}
          actions={
            <>
              <SearchField
                label="Search orders"
                placeholder="Order or customer"
                variant="outline"
                value={query}
                onValueChange={(next) => {
                  setQuery(next);
                  setPage(1);
                }}
              />
              <ColumnSettings
                columns={COLUMN_SETTINGS}
                layout={layout}
                onLayoutChange={setLayout}
              />
            </>
          }
        >
          <FilterPill
            label="Channel"
            value={CHANNELS.find((option) => option.value === channel)?.label}
            onRemove={
              channel === undefined
                ? undefined
                : () => {
                    setChannel(undefined);
                  }
            }
          >
            <SegmentedControl<Order["channel"]>
              label="Channel"
              options={CHANNELS}
              value={channel}
              onValueChange={(next) => {
                setChannel(next);
                setPage(1);
              }}
            />
          </FilterPill>
        </FilterBar>
        <DataTable<Order>
          label="Orders"
          columns={columns}
          rows={shown}
          rowKey={(order) => order.id}
          rowLabel={(order) => order.id}
          selectable
          sort={sort}
          onSortChange={setSort}
          onClearAll={clearAll}
          pagination={{
            page,
            pageSize: PAGE_SIZE,
            total: matching.length,
            onPageChange: setPage,
          }}
          rowActions={(order) => (
            <>
              <Menu.Item
                onSelect={() => {
                  go(`#/roastery/customers/${order.customerId}`);
                }}
              >
                View customer
              </Menu.Item>
              <Menu.Item
                onSelect={() => {
                  toast.success(`Refund started for ${order.id}`);
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
