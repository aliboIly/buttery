import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import {
  Breadcrumbs,
  Button,
  DetailPage,
  StatusBadge,
  toast,
} from "@butteryui/react";
import { money, shortDate } from "../data.ts";
import type { Order, OrderStatus } from "../data.ts";
import { useLink } from "../router.tsx";
import { STATUSES } from "../status.ts";

function NextStep({
  order,
  onStatusChange,
}: {
  readonly order: Order;
  readonly onStatusChange: (status: OrderStatus) => void;
}): ReactElement | null {
  switch (order.status) {
    case "unpaid":
      return (
        <Button
          variant="primary"
          onClick={() => {
            toast(`Sent ${order.customer} a reminder to pay.`);
          }}
        >
          Send a reminder
        </Button>
      );
    case "paid":
      return (
        <Button
          variant="primary"
          onClick={() => {
            onStatusChange("shipped");
            toast.success(`Order ${order.id} is on its way.`);
          }}
        >
          Mark as shipped
        </Button>
      );
    case "shipped":
      return (
        <Button
          variant="primary"
          onClick={() => {
            toast(`Emailed ${order.customer} a return label.`);
          }}
        >
          Send a return label
        </Button>
      );
    case "refunded":
      return null;
    default: {
      const unknown: never = order.status;
      throw new Error(`No step for an order that's ${String(unknown)}.`);
    }
  }
}

/** One order: what was bought, by whom and where it is, with the step it's waiting on at the top of the aside. */
export function OrderPage({
  order,
  onStatusChange,
}: {
  readonly order: Order;
  readonly onStatusChange: (status: OrderStatus) => void;
}): ReactElement {
  const link = useLink();
  const status = STATUSES[order.status];
  return (
    <DetailPage
      title={`Order ${order.id}`}
      breadcrumbs={
        <Breadcrumbs items={[{ label: "Orders", href: link("/orders") }]} />
      }
      description={`Placed ${shortDate(order.placed)} by ${order.customer}`}
      action={<NextStep order={order} onStatusChange={onStatusChange} />}
      aside={
        <DetailPage.Links
          title="Customer"
          links={[
            {
              label: `Orders from ${order.customer}`,
              href: link(`/search?q=${encodeURIComponent(order.customer)}`),
            },
            { label: "Every order", href: link("/orders") },
          ]}
        />
      }
    >
      <Stack gap={3} align="start">
        <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
        <Text variant="title-lg">{money(order.amount)}</Text>
        <Text variant="body">{order.item}</Text>
      </Stack>
    </DetailPage>
  );
}
