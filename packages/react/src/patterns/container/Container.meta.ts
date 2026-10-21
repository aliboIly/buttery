import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "Container",
  kind: "pattern",
  purpose:
    "The page's content column: at most 1200px wide, centered, with side padding that grows with the page.",
  useWhen: [
    "Content on a page that isn't in a Section, such as a header row",
    "Your own band of a page with contained={false} on its Section",
  ],
  avoidWhen: [
    "A Section's content: Section already puts it in a Container",
    "App screens: use AppShell and its panels",
  ],
  related: ["Page", "Section", "Grid"],
  a11y: "A plain element with no role; pass asChild to make a landmark of it.",
  motion: "none",
};
