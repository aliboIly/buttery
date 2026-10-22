import { Download } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, FilterBar, FilterPill } from "@buttery/react";

const STATUSES = ["Paid", "Unpaid", "Refunded"] as const;

type Status = (typeof STATUSES)[number];

interface Order {
  readonly id: string;
  readonly customer: string;
  readonly status: Status;
}

const ORDERS: readonly Order[] = [
  { id: "#1041", customer: "Larkspur Café", status: "Paid" },
  { id: "#1042", customer: "Northgate Bakery", status: "Unpaid" },
  { id: "#1043", customer: "Wren Street Deli", status: "Paid" },
  { id: "#1044", customer: "Saltmarsh Kitchen", status: "Refunded" },
  { id: "#1045", customer: "Copperleaf Books", status: "Unpaid" },
];

/** Filters over a list of orders: pick a status from its pill, clear it, or export what's shown. */
export function OrderFilters(): ReactElement {
  const [status, setStatus] = useState<Status | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [exported, setExported] = useState<number | undefined>(undefined);
  const shown =
    status === undefined
      ? ORDERS
      : ORDERS.filter((order) => order.status === status);
  return (
    <Stack gap={4}>
      <FilterBar
        onClearAll={() => {
          setStatus(undefined);
        }}
        actions={
          <Button
            size="sm"
            iconStart={Download}
            onClick={() => {
              setExported(shown.length);
            }}
          >
            Export
          </Button>
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
      <Stack gap={2}>
        <Text variant="label">{`${String(shown.length)} of ${String(ORDERS.length)} orders`}</Text>
        {shown.map((order) => (
          <Text key={order.id} variant="body-sm" tone="secondary">
            {`${order.id} · ${order.customer} · ${order.status}`}
          </Text>
        ))}
      </Stack>
      {exported === undefined ? null : (
        <Text variant="caption">{`Exported ${String(exported)} orders as CSV`}</Text>
      )}
    </Stack>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Filters");
  await press("button", "Status");
  await press("button", "Unpaid");
  await see("2 of 5 orders");
  await press("button", "Export");
  await see("Exported 2 orders as CSV");
};
