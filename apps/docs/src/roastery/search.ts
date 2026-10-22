import { matchesSearch } from "@buttery/react";
import type {
  LocalSearchSource,
  RemoteSearchSource,
  SearchFilter,
  SearchPage,
  SearchQuery,
} from "@buttery/react";
import { CircleHelp, Receipt, User } from "lucide-react";
import { CUSTOMERS, ORDERS } from "./data.ts";
import type { Customer } from "./data.ts";
import { money } from "./format.ts";
import { navPages } from "./nav.ts";
import { SETTINGS, settingHref } from "./settings-list.ts";

/** Every page of the demo: the sidebar's, from its navigation, and each setting the settings index reaches. */
export const PAGES: readonly SearchPage[] = [
  ...navPages().filter((page) => page.href.startsWith("/demos/roastery")),
  ...SETTINGS.filter((setting) => setting.href === undefined).map(
    (setting) => ({
      label: setting.title,
      path: ["Settings"],
      href: settingHref(setting),
      icon: setting.icon,
    }),
  ),
];

/** The filters the search takes. */
export const FILTERS: readonly SearchFilter[] = [
  {
    key: "status",
    example: "shipped",
    description: "where an order has got to",
    values: ["unpaid", "paid", "roasting", "shipped", "refunded"],
  },
  {
    key: "channel",
    example: "wholesale",
    description: "how an order came in",
    values: ["web", "wholesale", "subscription"],
  },
  {
    key: "city",
    example: "Portland",
    description: "where a customer is",
    values: [...new Set(CUSTOMERS.map((customer) => customer.city))].sort(),
  },
];

const BY_ID = new Map(CUSTOMERS.map((customer) => [customer.id, customer]));

function filterOf(query: SearchQuery, key: string): string | undefined {
  return query.filters.find((token) => token.key === key)?.value.toLowerCase();
}

function wordsMatch(query: SearchQuery, ...fields: readonly string[]): boolean {
  return query.text.trim() === "" || matchesSearch(query.text, ...fields);
}

function cityMatches(
  customer: Customer | undefined,
  city: string | undefined,
): boolean {
  return city === undefined || customer?.city.toLowerCase() === city;
}

/** Orders by their number or their customer's name, narrowed by status, channel and city. */
export const ORDER_SOURCE: LocalSearchSource = {
  id: "orders",
  label: "Orders",
  search: (query) => {
    const status = filterOf(query, "status");
    const channel = filterOf(query, "channel");
    const city = filterOf(query, "city");
    return ORDERS.filter((order) => {
      const customer = BY_ID.get(order.customerId);
      return (
        (status === undefined || order.status === status) &&
        (channel === undefined || order.channel === channel) &&
        cityMatches(customer, city) &&
        wordsMatch(query, order.id, customer?.name ?? "")
      );
    }).map((order) => ({
      id: order.id,
      label: order.id,
      detail: `${BY_ID.get(order.customerId)?.name ?? "Someone"}, ${money(order.amount)}, ${order.status}`,
      icon: Receipt,
      href: `/demos/roastery/customers/${order.customerId}`,
    }));
  },
};

/** Customers by name, email or city; order filters find no one. */
export const CUSTOMER_SOURCE: LocalSearchSource = {
  id: "customers",
  label: "Customers",
  search: (query) => {
    if (query.filters.some((token) => token.key !== "city")) return [];
    const city = filterOf(query, "city");
    return CUSTOMERS.filter(
      (customer) =>
        cityMatches(customer, city) &&
        wordsMatch(query, customer.name, customer.email, customer.city),
    ).map((customer) => ({
      id: customer.id,
      label: customer.name,
      detail: `${customer.city}, ${customer.email}`,
      icon: User,
      href: `/demos/roastery/customers/${customer.id}`,
    }));
  },
};

/** The help center's articles, which the help panel can open. */
export const ARTICLES: readonly {
  readonly id: string;
  readonly title: string;
  readonly body: string;
}[] = [
  {
    id: "roast-profile",
    title: "Change a roast profile",
    body: "A roast profile sets the curve a batch follows. Edit it from the coffee's page; batches already planned keep the profile they were planned with.",
  },
  {
    id: "pause-subscription",
    title: "Pause a subscription",
    body: "From the subscription's menu, choose Pause. Its next bag waits until you resume it, and nothing is charged meanwhile.",
  },
  {
    id: "payouts",
    title: "When payouts arrive",
    body: "Sales from Monday to Sunday are paid out together on the Friday after, to the bank in Payouts.",
  },
  {
    id: "pickup",
    title: "Let customers collect at the roastery",
    body: "In Pickup, turn on local pickup and set the address. Customers choose it at checkout and pay nothing for shipping.",
  },
  {
    id: "wholesale-terms",
    title: "Invoice cafés on terms",
    body: "Wholesale accounts can pay 30 days after an order ships. Set the terms on the account's page.",
  },
  {
    id: "low-stock",
    title: "Get an alert when green coffee runs low",
    body: "Turn on the low stock alert in Notifications, and the roastery emails you when a lot drops under 200 kg.",
  },
];

/** The help center, answering from a pretend server; choosing an article opens it in the help panel. */
export function helpSource(
  open: (article: string) => void,
): RemoteSearchSource {
  return {
    id: "help",
    label: "Help",
    remote: true,
    search: (query, signal) =>
      new Promise((resolve, reject) => {
        const timer = window.setTimeout(() => {
          resolve(
            query.filters.length > 0
              ? []
              : ARTICLES.filter((article) =>
                  matchesSearch(query.text, article.title, article.body),
                ).map((article) => ({
                  id: article.id,
                  label: article.title,
                  icon: CircleHelp,
                  onSelect: () => {
                    open(article.id);
                  },
                })),
          );
        }, 300);
        signal.addEventListener("abort", () => {
          window.clearTimeout(timer);
          reject(new DOMException("The search moved on.", "AbortError"));
        });
      }),
  };
}
