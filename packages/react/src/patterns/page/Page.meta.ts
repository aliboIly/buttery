import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "Page",
  kind: "pattern",
  purpose:
    "A marketing or content page: a column of sections that the page grid, side padding and headline sizes follow.",
  useWhen: [
    "A landing page, a product page or an article",
    "Any page built from Section, SplitHero, Bento and the other page patterns",
  ],
  avoidWhen: ["App screens: use AppShell"],
  related: ["Section", "Container", "SplitHero", "NavBar"],
  a11y: "No role of its own; pass asChild with a main element to make it the page's main landmark.",
  motion: "none",
};
