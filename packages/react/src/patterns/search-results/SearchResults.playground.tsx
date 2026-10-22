import type { DemoSection, DocsPage } from "@buttery/core";
import { SearchResults, matchesSearch, pageSource } from "@buttery/react";
import type { LocalSearchSource } from "@buttery/react";
import { Settings } from "lucide-react";

export const page: DocsPage = {
  section: "patterns",
  title: "SearchResults",
  description:
    "Every result for a search on one page, a section for each place it looked.",
  order: 250,
  status: "new",
  since: "0.7.0",
  home: "patterns/search-and-results",
};

const PAGES = pageSource({
  pages: [
    {
      label: "Shipping rates",
      path: ["Settings"],
      href: "#/search-results/shipping-rates",
      icon: Settings,
    },
    {
      label: "Shipping labels",
      path: ["Orders"],
      href: "#/search-results/shipping-labels",
      icon: Settings,
    },
  ],
});

const ORDERS: LocalSearchSource = {
  id: "orders",
  label: "Orders",
  search: (query) =>
    [
      { id: "1042", label: "Order 1042, shipping today", detail: "$48.00" },
      { id: "1043", label: "Order 1043, shipping Friday", detail: "$22.50" },
    ]
      .filter((order) => matchesSearch(query.text, order.label))
      .map((order) => ({
        ...order,
        href: `#/search-results/orders/${order.id}`,
      })),
};

export const demos: readonly DemoSection[] = [
  {
    title: "Results for a search",
    description:
      "Its title says what was searched for, then a section for each source with every result.",
    render: () => (
      <SearchResults
        width="medium"
        query={{ text: "shipping", filters: [] }}
        sources={[PAGES, ORDERS]}
      />
    ),
  },
];
