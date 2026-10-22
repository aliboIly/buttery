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
  keyboard: [],
  layout:
    "It's its own size container. From 1024px of room the article takes 8 of 12 columns and the aside the last 3, a column apart, and the aside sticks under the sticky bars with 24px of padding, fitting between them and stopping at the article's end; with less room the aside follows the article as a plain block, 48px under it, and the text wraps.",
};
