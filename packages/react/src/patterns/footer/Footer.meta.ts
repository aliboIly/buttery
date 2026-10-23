import type { ComponentMeta } from "@butteryui/core";

export const meta: ComponentMeta = {
  name: "Footer",
  kind: "pattern",
  purpose:
    "The foot of a page: a brand column and columns of links on the page grid, then small print under a divider.",
  useWhen: ["The end of a marketing, docs or help page"],
  avoidWhen: [
    "App screens: put links in the sidebar or a menu",
    "The bottom of a dialog or panel: give it an actions row",
  ],
  related: ["Page", "Section", "Container", "NavBar"],
  a11y: "It's the page's contentinfo landmark. Each column is a list of links named by its heading, an h2; links are at least 24px tall.",
  motion: "none",
  keyboard: [],
  layout:
    "It takes its container's width and sets its content on the page container, 1200px at most, in a grid of 4, 8 or 12 columns by its own width: the brand takes 4 of 12 columns, or a row of its own under 1024px, and each column of links takes 2. The small print sits under a 1px divider 48px below the grid; links wrap rather than truncate, and each is at least 24px tall.",
};
