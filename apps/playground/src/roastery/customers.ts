import {
  CUSTOMERS,
  SUBSCRIPTIONS,
  TODAY,
  dayNumber,
  ordersOf,
  salesTotal,
} from "./data.ts";
import type { Customer, Order } from "./data.ts";

/** A customer with what they've bought, for the customers table. */
export interface CustomerRow extends Customer {
  readonly orders: readonly Order[];
  readonly spent: number;
  readonly subscribed: boolean;
}

export const CUSTOMER_ROWS: readonly CustomerRow[] = CUSTOMERS.map(
  (customer) => {
    const orders = ordersOf(customer.id);
    return {
      ...customer,
      orders,
      spent: salesTotal(orders),
      subscribed: SUBSCRIPTIONS.some(
        (subscription) =>
          subscription.customerId === customer.id &&
          subscription.status === "active",
      ),
    };
  },
);

/** Whether a customer joined in the last 30 days. */
export function isNew(customer: Customer): boolean {
  return dayNumber(TODAY) - dayNumber(customer.since) < 30;
}
