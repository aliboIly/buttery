import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "Breadcrumbs",
  kind: "component",
  purpose:
    "The trail of pages above the one shown, as links, so a nested page says where it sits and how to go back up.",
  useWhen: [
    "A page nested under another, such as one plan under Settings and its plans",
    "Above a PageHeader's title, through its breadcrumbs prop",
  ],
  avoidWhen: [
    "A top-level page: it has no trail",
    "Steps in a flow: use the flow's own progress, such as PageDots",
    "Moving between sibling pages: use Tabs or TabNav",
  ],
  related: ["PageHeader", "TabNav", "AppPage"],
  a11y: "A navigation landmark named Breadcrumbs (or label) holding an ordered list of links; the chevrons between them are hidden from screen readers. The page itself isn't a crumb: its title is the page header's h1. Each link's target reaches 24px tall.",
  motion: "none",
};
