import type { StatusTone } from "@butteryui/react";
import type { OrderStatus } from "./data.ts";

/** How each order status reads, and its badge's tone. */
export const STATUSES: Readonly<
  Record<OrderStatus, { readonly label: string; readonly tone: StatusTone }>
> = {
  unpaid: { label: "Unpaid", tone: "warning" },
  paid: { label: "Paid", tone: "info" },
  shipped: { label: "Shipped", tone: "success" },
  refunded: { label: "Refunded", tone: "danger" },
};
