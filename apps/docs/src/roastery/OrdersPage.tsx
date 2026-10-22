import { Menu } from "@buttery/core";
import {
  AppPage,
  ColumnSettings,
  DataTable,
  FilterBar,
  FilterPill,
  PageHeader,
  SavedViews,
  SearchField,
  SegmentedControl,
  StatusBadge,
  toast,
} from "@buttery/react";
import type {
  ColumnLayout,
  DataTableColumn,
  DataTableSort,
  SavedView,
  StatusTone,
} from "@buttery/react";
import { Download } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import { customerCell } from "./customer-cell.tsx";
import { ORDERS, TODAY, coffeeOf, customerOf, dayNumber } from "./data.ts";
import type { Order, OrderStatus } from "./data.ts";
import { dateTime } from "./format.ts";
import { useSimulatedLoad } from "./loading.ts";
import { go } from "./navigation.ts";
import { RenameView } from "./rename-view.tsx";

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

/** A view someone saved: the built-in view it was made from and the filters it keeps. */
interface Filters {
  readonly base: string;
  readonly channel: Order["channel"] | undefined;
  readonly query: string;
}

const VIEWS: readonly SavedView[] = [
  { id: "all", label: "All orders" },
  { id: "to-roast", label: "To roast" },
  { id: "unpaid", label: "Unpaid" },
  { id: "this-week", label: "Shipped this week" },
  { id: "refunds", label: "Refunds" },
];

function inView(view: string, order: Order): boolean {
  switch (view) {
    case "to-roast":
      return order.status === "paid" || order.status === "roasting";
    case "unpaid":
      return order.status === "unpaid";
    case "this-week":
      return (
        order.status === "shipped" &&
        dayNumber(TODAY) - dayNumber(order.placed) < 7
      );
    case "refunds":
      return order.status === "refunded";
    default:
      return true;
  }
}

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

/** Every order, in saved views, with filters, a search and the columns people choose. */
export function OrdersPage({
  onNewOrder,
}: {
  readonly onNewOrder: () => void;
}): ReactElement {
  const [views, setViews] = useState(VIEWS);
  const [saved, setSaved] = useState<ReadonlyMap<string, Filters>>(new Map());
  const [view, setView] = useState("all");
  const [renaming, setRenaming] = useState(false);
  const [channel, setChannel] = useState<Order["channel"] | undefined>(
    undefined,
  );
  const [query, setQuery] = useState("");
  const loading = useSimulatedLoad(view, 700);
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
  const base = saved.get(view)?.base ?? view;
  const matching = ORDERS.filter(
    (order) =>
      inView(base, order) &&
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
  const choose = (next: string): void => {
    const filters = saved.get(next);
    setView(next);
    if (filters !== undefined) {
      setChannel(filters.channel);
      setQuery(filters.query);
    }
    setPage(1);
  };
  const saveAs = (): void => {
    const id = `saved-${String(saved.size + 1)}`;
    const label =
      CHANNELS.find((option) => option.value === channel)?.label ??
      (query.trim() === "" ? "My orders" : `“${query.trim()}”`);
    setSaved(new Map(saved).set(id, { base, channel, query }));
    setViews([...views, { id, label }]);
    setView(id);
    toast.success(`Saved the view “${label}”`);
  };
  const clearAll = (): void => {
    setView("all");
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
          description="Every order from the shop, cafés and subscriptions."
          actions={
            <>
              <PageHeader.Action
                label="Export"
                icon={Download}
                onSelect={() => {
                  toast(
                    `Exported ${String(matching.length)} ${matching.length === 1 ? "order" : "orders"} to orders.csv`,
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
        <SavedViews
          label="Order views"
          views={views}
          value={view}
          onValueChange={choose}
          actions={
            <Menu.Item
              onSelect={() => {
                setRenaming(true);
              }}
            >
              Rename view
            </Menu.Item>
          }
          onSaveAs={saveAs}
        />
        <RenameView
          open={renaming}
          onOpenChange={setRenaming}
          name={views.find((candidate) => candidate.id === view)?.label ?? ""}
          onRename={(label) => {
            setViews(
              views.map((candidate) =>
                candidate.id === view ? { ...candidate, label } : candidate,
              ),
            );
          }}
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
            <SegmentedControl<Order["channel"] | "all">
              label="Channel"
              options={[{ value: "all", label: "All" }, ...CHANNELS]}
              value={channel ?? "all"}
              onValueChange={(next) => {
                setChannel(next === "all" ? undefined : next);
                setPage(1);
              }}
            />
          </FilterPill>
        </FilterBar>
        <DataTable<Order>
          label="Orders"
          loading={loading}
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
                  go(`/demos/roastery/customers/${order.customerId}`);
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
