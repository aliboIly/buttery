import type { ComponentMeta } from "@butteryui/core";

export const meta: ComponentMeta = {
  name: "DetailPage",
  kind: "pattern",
  purpose:
    "A page about one thing: its title over a hairline, the main column, and an aside with one primary action and lists of links, which drops below under 1100px.",
  useWhen: [
    "One plan, price list, product or integration, with its main facts and one thing to do about it",
    "A page reached from a list or a catalog, under breadcrumbs",
  ],
  avoidWhen: [
    "A record with tabs of related lists, such as a customer: use AppPage with an aside",
    "A page of settings: use SettingsPage",
  ],
  related: ["AppPage", "PageHeader", "Breadcrumbs", "CatalogPage"],
  a11y: "The page's main landmark, its title the h1. The aside is a complementary landmark named by asideLabel; each list of links is a region named by its h2. Each link's target is at least 24px tall.",
  motion: "none",
  keyboard: [
    { keys: "Enter", does: "Follows the focused link in the aside's lists" },
  ],
  layout:
    "It's an AppPage, at most 1280px wide (--bt-w-app-page), its header over a hairline. From 1100px of column the 320px aside (--bt-w-aside) sits beside the main column, 32 apart, and under it otherwise; the aside's primary action is full width, its lists sit 24 apart, and each link is at least 24px tall.",
};
