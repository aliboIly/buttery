import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Menu, Stack } from "@buttery/core";
import { demoChoice } from "@buttery/core";
import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";
import { Button, DataTable, StatusBadge } from "@buttery/react";
import type { DataTableColumn, DataTableSort } from "@buttery/react";

export const page: DocsPage = {
  section: "components/data-display",
  title: "DataTable",
  description:
    "A table of records: columns with minimum widths and shares, selection, sorting, row actions, a sticky header and first column, skeleton rows and pagination.",
  order: 60,
  status: "new",
  since: "0.7.0",
};

interface Order {
  readonly id: string;
  readonly customer: string;
  readonly paid: boolean;
  readonly total: number;
}

const CUSTOMERS = [
  "Ines Vale",
  "Tomas Reyes",
  "Mira Okafor",
  "Lena Park",
  "Omar Haddad",
  "Ana de la Cruz",
  "Kofi Mensah",
];

const ORDERS: readonly Order[] = Array.from({ length: 23 }, (_, index) => ({
  id: `ORD-${String(2041 + index)}`,
  customer: CUSTOMERS[index % CUSTOMERS.length] ?? "",
  paid: index % 3 !== 1,
  total: 14 + ((index * 37) % 90) + 0.5,
}));

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

const PAGE = 8;

const LIVE_COLUMNS: readonly DataTableColumn<Order>[] = COLUMNS.map(
  (column) => ({ ...column, sortable: false }),
);

export const live: LiveDemo = {
  controls: {
    selectable: { kind: "toggle", initial: false },
    loading: { kind: "toggle", initial: false },
    size: {
      kind: "choice",
      options: ["default", "compact"],
      initial: "default",
    },
  },
  render: ({ selectable, loading, size }) => (
    <DataTable
      label="Orders"
      columns={LIVE_COLUMNS}
      rows={ORDERS.slice(0, 4)}
      rowKey={(order) => order.id}
      rowLabel={(order) => order.id}
      selectable={selectable === true}
      loading={loading === true}
      size={demoChoice(size, ["default", "compact"])}
    />
  ),
  code: ({ selectable, loading, size }) =>
    [
      "<DataTable",
      '  label="Orders"',
      "  columns={columns}",
      "  rows={orders}",
      "  rowKey={(order) => order.id}",
      "  rowLabel={(order) => order.id}",
      ...(selectable === true ? ["  selectable"] : []),
      ...(loading === true ? ["  loading"] : []),
      ...(size === "compact" ? ['  size="compact"'] : []),
      "/>",
    ].join("\n"),
};

function Orders(): ReactElement {
  const [sort, setSort] = useState<DataTableSort | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const ordered =
    sort === null
      ? ORDERS
      : [...ORDERS].sort((a, b) => {
          const sign = sort.direction === "ascending" ? 1 : -1;
          return sort.column === "total"
            ? (a.total - b.total) * sign
            : a.customer.localeCompare(b.customer) * sign;
        });
  return (
    <Stack gap={3}>
      <Inline>
        <Button
          size="sm"
          onClick={() => {
            setLoading(true);
            window.setTimeout(() => {
              setLoading(false);
            }, 1200);
          }}
        >
          Reload
        </Button>
      </Inline>
      <DataTable
        label="Orders"
        columns={COLUMNS}
        rows={ordered.slice((page - 1) * PAGE, page * PAGE)}
        rowKey={(order) => order.id}
        rowLabel={(order) => order.id}
        selectable
        sort={sort}
        onSortChange={setSort}
        loading={loading}
        pagination={{
          page,
          pageSize: PAGE,
          total: ORDERS.length,
          onPageChange: setPage,
        }}
        rowActions={() => (
          <>
            <Menu.Item>Resend receipt</Menu.Item>
            <Menu.Item>Refund</Menu.Item>
          </>
        )}
      />
    </Stack>
  );
}

export const demos: readonly DemoSection[] = [
  {
    title: "Orders",
    description:
      "Select rows, sort by customer or total, open a row's actions, page through, or reload for the skeleton rows.",
    render: () => <Orders />,
  },
  {
    title: "No results",
    render: () => (
      <DataTable
        label="Filtered orders"
        columns={COLUMNS}
        rows={[]}
        rowKey={(order) => order.id}
        onClearAll={() => undefined}
      />
    ),
  },
];
