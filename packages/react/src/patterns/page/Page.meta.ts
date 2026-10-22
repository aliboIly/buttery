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
  keyboard: [],
  layout:
    "It takes its container's width as a column of sections on the surface background, and it's the size container the page grid follows: the side padding inside it (16, 24 or 32px) and the display type step up as its own width passes 640 and 1024px. It sets no height, truncates nothing and has no hit areas of its own.",
};
