import { CUSTOMERS, ORDERS, SUBSCRIPTIONS, TODAY, salesTotal } from "./data.ts";
import type { Customer, Order } from "./data.ts";

/** A customer with what they've bought, for the customers table. */
export interface CustomerRow extends Customer {
  readonly orders: readonly Order[];
  readonly spent: number;
  readonly subscribed: boolean;
}

export const CUSTOMER_ROWS: readonly CustomerRow[] = CUSTOMERS.map(
  (customer) => {
    const orders = ORDERS.filter((order) => order.customerId === customer.id);
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

const MONTH = 30 * 86_400_000;

export function isNew(customer: Customer): boolean {
  return TODAY.getTime() - customer.since.getTime() < MONTH;
}
