import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import {
  Button,
  DataTable,
  FilterBar,
  FilterPill,
  SearchField,
  StatusBadge,
} from "@butteryui/react";
import type { DataTableColumn } from "@butteryui/react";

const STATUSES = ["Paid", "Unpaid", "Refunded"] as const;

type Status = (typeof STATUSES)[number];

interface Order {
  readonly id: string;
  readonly customer: string;
  readonly status: Status;
  readonly total: number;
}

const ORDERS: readonly Order[] = [
  { id: "ORD-3101", customer: "Larkspur Café", status: "Paid", total: 64 },
  { id: "ORD-3102", customer: "Northgate Bakery", status: "Unpaid", total: 38 },
  { id: "ORD-3103", customer: "Wren Street Deli", status: "Paid", total: 112 },
  {
    id: "ORD-3104",
    customer: "Saltmarsh Kitchen",
    status: "Refunded",
    total: 21,
  },
  { id: "ORD-3105", customer: "Larkspur Café", status: "Unpaid", total: 47 },
];

const TONES = {
  Paid: "success",
  Unpaid: "warning",
  Refunded: "neutral",
} as const;

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
    cell: (order) => order.customer,
  },
  {
    id: "status",
    header: "Status",
    skeleton: "badge",
    cell: (order) => (
      <StatusBadge tone={TONES[order.status]}>{order.status}</StatusBadge>
    ),
  },
  {
    id: "total",
    header: "Total",
    align: "end",
    cell: (order) => <DataTable.Amount value={order.total} currency="USD" />,
  },
];

/** A filter bar over an orders table: a status pill, and a search among its actions. */
export function OrdersTable(): ReactElement {
  const [status, setStatus] = useState<Status | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const clear = (): void => {
    setStatus(undefined);
    setQuery("");
  };
  const rows = ORDERS.filter(
    (order) =>
      (status === undefined || order.status === status) &&
      order.customer.toLowerCase().includes(query.trim().toLowerCase()),
  );
  return (
    <Stack gap={4}>
      <FilterBar
        onClearAll={clear}
        actions={
          <SearchField
            label="Search orders"
            placeholder="Customer"
            value={query}
            onValueChange={setQuery}
          />
        }
      >
        <FilterPill
          label="Status"
          value={status}
          open={open}
          onOpenChange={setOpen}
          onRemove={() => {
            setStatus(undefined);
          }}
        >
          <Stack gap={1}>
            {STATUSES.map((choice) => (
              <Button
                key={choice}
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatus(choice);
                  setOpen(false);
                }}
              >
                {choice}
              </Button>
            ))}
          </Stack>
        </FilterPill>
      </FilterBar>
      <Text variant="caption">{`${String(rows.length)} of ${String(ORDERS.length)} orders`}</Text>
      <DataTable
        label="Orders"
        columns={COLUMNS}
        rows={rows}
        rowKey={(order) => order.id}
        rowLabel={(order) => order.id}
        onClearAll={clear}
      />
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, type, see }) => {
  await type("Search orders", "Larkspur");
  await see("2 of 5 orders");
  await press("button", "Filters");
  await press("button", "Status");
  await press("button", "Unpaid");
  await see("1 of 5 orders");
};
