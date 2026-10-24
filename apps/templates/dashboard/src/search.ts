import { matchesSearch } from "@butteryui/react";
import type { LocalSearchSource } from "@butteryui/react";
import { Package, Receipt } from "lucide-react";
import { PRODUCTS, money, shortDate } from "./data.ts";
import type { Order } from "./data.ts";

/**
 * What the top bar's search and the search page look through: the orders, each a link to its page, and the
 * products, each a link to the products page.
 */
export function searchSources(
  orders: readonly Order[],
  link: (path: string) => string,
): readonly LocalSearchSource[] {
  return [
    {
      id: "orders",
      label: "Orders",
      search: (query) =>
        orders
          .filter((order) =>
            matchesSearch(query.text, order.id, order.customer, order.item),
          )
          .map((order) => ({
            id: order.id,
            label: `Order ${order.id}`,
            detail: `${order.customer}, ${order.item}, ${shortDate(order.placed)}`,
            icon: Receipt,
            href: link(`/orders/${order.id}`),
          })),
    },
    {
      id: "products",
      label: "Products",
      search: (query) =>
        PRODUCTS.filter((product) =>
          matchesSearch(query.text, product.name, product.description),
        ).map((product) => ({
          id: product.id,
          label: product.name,
          detail: `${money(product.price)}, ${String(product.stock)} left`,
          icon: Package,
          href: link("/products"),
        })),
    },
  ];
}
