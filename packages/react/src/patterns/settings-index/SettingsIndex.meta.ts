import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "SettingsIndex",
  kind: "pattern",
  purpose:
    "A settings home page: titled sections of links, each with an icon, a title and a line on what's inside, in up to three columns.",
  useWhen: [
    "The page behind a Settings link, leading to each settings page",
    "Any index of a dozen or more pages grouped by topic",
  ],
  avoidWhen: [
    "Moving between pages from anywhere: use Sidebar",
    "A few choices to start something: use ChoiceDialog",
  ],
  related: ["Sidebar", "ChoiceDialog", "AppPage", "PageHeader"],
  a11y: "Each section is a region named by its heading, an h2 by default, holding a list of links. Each link is named by the page's title and its line.",
  motion: "none",
};
