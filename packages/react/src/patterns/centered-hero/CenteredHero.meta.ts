import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "CenteredHero",
  kind: "pattern",
  purpose:
    "A page's opening band: a centered two-tone headline, a line and actions above a full-width visual that assembles.",
  useWhen: [
    "The top of a page with a wide visual, such as a whole app screen",
    "A short page with words alone",
  ],
  avoidWhen: [
    "A tall or narrow visual beside the words: use SplitHero",
    "Bands further down a page: use Section",
  ],
  related: ["SplitHero", "HeroText", "Section", "Stagger"],
  a11y: "A region named by its headline, the page's h1. The visual's pieces arrive with a rise and a fade; with reduced motion they simply show.",
  motion: "presence",
};
