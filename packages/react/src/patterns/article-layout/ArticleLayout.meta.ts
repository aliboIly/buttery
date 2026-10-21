import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "ArticleLayout",
  kind: "pattern",
  purpose:
    "An article beside a sticky aside on the page grid: 8 columns for the article, the last 3 for the aside.",
  useWhen: [
    "A long read with a table of contents or related links beside it",
    "Guides, release notes, a changelog",
  ],
  avoidWhen: [
    "App screens: use AppShell",
    "An article with nothing beside it: put it straight in a Section",
  ],
  related: ["Section", "Page", "Sticky", "SubNav"],
  a11y: "The aside is a complementary landmark named by `asideLabel`. It comes after the article in reading order, and it still does when the two stack.",
  motion: "none",
};
