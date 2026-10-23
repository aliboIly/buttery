import type { ComponentMeta } from "@butteryui/core";

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
  a11y: "A region named by its headline, the page's h1, or an h2 with titleAs=\"h2\" for a band further down. The visual's pieces arrive with a rise and a fade; with reduced motion they simply show.",
  motion: "presence",
  keyboard: [],
  layout:
    "It's its own size container. The words are centered on at most 8 of the page's 12 columns (the whole width under 640px), the headline wrapping at 22ch and the body at 60ch, and the visual takes the column's width 48px under them (64 from 1024px), with 96px above and below the band (64 under 640px, 128 from 1024px). The band is the surface, or with variant=\"tinted\" bg-tint, a fill from the palettes the words keep AA contrast on.",
  reducedMotion:
    "The visual's pieces show at once instead of rising into place one after another.",
};
