import type { ComponentMeta } from "@buttery/core";

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
};
