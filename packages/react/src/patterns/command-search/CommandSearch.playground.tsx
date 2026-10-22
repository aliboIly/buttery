import type { DemoSection, DocsPage } from "@buttery/core";
import {
  CommandSearch,
  formatSearch,
  matchesSearch,
  pageSource,
} from "@buttery/react";
import type { LocalSearchSource, RemoteSearchSource } from "@buttery/react";
import { CircleHelp, Package, Settings, Users } from "lucide-react";

export const page: DocsPage = {
  section: "components/navigation",
  title: "CommandSearch",
  description:
    "The top bar's search: grouped results from typed sources, filters and recent searches.",
  order: 20,
  status: "new",
  since: "0.7.0",
};

const PAGES = pageSource({
  pages: [
    { label: "Orders", href: "#/command-search/orders", icon: Package },
    { label: "Customers", href: "#/command-search/customers", icon: Users },
    {
      label: "Team notifications",
      path: ["Settings"],
      href: "#/command-search/team-notifications",
      icon: Settings,
    },
    {
      label: "Plans and billing",
      path: ["Settings"],
      href: "#/command-search/plans",
      icon: Settings,
    },
  ],
});

const CUSTOMERS: LocalSearchSource = {
  id: "customers",
  label: "Customers",
  search: (query) =>
    [
      { name: "Ines Vale", email: "ines@example.com" },
      { name: "Oskar Lind", email: "oskar@example.com" },
      { name: "Setareh Amini", email: "setareh@example.com" },
    ]
      .filter((customer) =>
        matchesSearch(query.text, customer.name, customer.email),
      )
      .map((customer) => ({
        id: customer.email,
        label: customer.name,
        detail: customer.email,
        href: `#/command-search/customers/${encodeURIComponent(customer.email)}`,
      })),
};

const ARTICLES = [
  "Change a roast profile",
  "Pause a subscription",
  "When payouts arrive",
  "Set shipping rates",
];

const HELP: RemoteSearchSource = {
  id: "help",
  label: "Help",
  remote: true,
  search: (query, signal) =>
    new Promise((resolve, reject) => {
      const timer = window.setTimeout(() => {
        resolve(
          ARTICLES.filter((title) => matchesSearch(query.text, title)).map(
            (title) => ({
              id: title,
              label: title,
              icon: CircleHelp,
              href: `#/command-search/help/${encodeURIComponent(title)}`,
            }),
          ),
        );
      }, 300);
      signal.addEventListener("abort", () => {
        window.clearTimeout(timer);
        reject(new DOMException("The search moved on.", "AbortError"));
      });
    }),
};

export const demos: readonly DemoSection[] = [
  {
    title: "Pages, customers and help",
    description:
      "Focus it with / or ⌘K. Pages and customers answer as you type; help asks a pretend server and shows a spinner row in its own group.",
    render: () => (
      <CommandSearch
        sources={[PAGES, CUSTOMERS, HELP]}
        filters={[
          {
            key: "status",
            example: "shipped",
            description: "where an order has got to",
            values: ["paid", "roasting", "shipped", "refunded"],
          },
          {
            key: "email",
            example: "ines@example.com",
            description: "a customer's email",
          },
        ]}
        filtersHref="#/command-search/filters"
        resultsHref={(query) =>
          `#/command-search/results?q=${encodeURIComponent(formatSearch(query))}`
        }
        emptyHint="Try another word, or a filter such as status:shipped."
        storageKey="playground-command-search"
      />
    ),
  },
];
