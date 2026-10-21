import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "SplitHero",
  kind: "pattern",
  purpose:
    "A page's opening band: a two-tone headline, a line and actions beside a visual that assembles as it arrives.",
  useWhen: [
    "The top of a landing or product page with a product picture or a living demo",
  ],
  avoidWhen: [
    "Words alone or a very wide visual: use CenteredHero",
    "Bands further down a page: use Section",
  ],
  related: ["CenteredHero", "HeroText", "Section", "Stagger"],
  a11y: "A region named by its headline, the page's h1, or an h2 with titleAs=\"h2\" for a band further down. The visual's pieces arrive with a rise and a fade; with reduced motion they simply show.",
  motion: "presence",
};
