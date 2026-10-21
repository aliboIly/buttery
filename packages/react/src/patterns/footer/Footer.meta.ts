import type { ComponentMeta } from "@buttery/core";

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
};
