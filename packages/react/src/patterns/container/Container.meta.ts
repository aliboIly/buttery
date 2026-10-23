import type { ComponentMeta } from "@butteryui/core";

export const meta: ComponentMeta = {
  name: "Container",
  kind: "pattern",
  purpose:
    "The page's content column: at most 1200px wide, centered, with side padding that grows with the page.",
  useWhen: [
    "Content on a page that isn't in a Section, such as a header row",
    "Your own band of a page with `contained={false}` on its Section",
  ],
  avoidWhen: [
    "A Section's content: Section already puts it in a Container",
    "App screens: use AppShell and its panels",
  ],
  related: ["Page", "Section", "Grid"],
  a11y: "A plain element with no role; pass asChild to make a landmark of it.",
  motion: "none",
  keyboard: [],
  layout:
    "It's as wide as its parent and centers a column at most 1200px wide (--bt-w-page) with side padding rather than margins: 16px a side, 24 from 640px of page and 32 from 1024px, more on a page wider than the column.",
};
