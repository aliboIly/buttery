import type { ComponentMeta } from "@butteryui/core";

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
  keyboard: [{ keys: "Enter", does: "Follows the link with focus" }],
  layout:
    "It takes the width it's given and keeps the trail on one line, long names truncating with an ellipsis and their full name as a title; under 480px of its own width it shows only the page one level up, after a back chevron. Each link's hit area reaches 24px tall.",
};
