import type { ComponentMeta } from "@butteryui/core";

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
  keyboard: [],
  layout:
    "Its own size container, it fills its parent's width in a Container with 96px of room above and below (64 under 640px wide, 128 from 1024). From 1024px the words take 7 of 12 columns and the visual 5, centered on each other; narrower, the visual sits 48px under the words. The headline wraps at 22ch and the body at 60ch, the actions wrap 24px under the body, and its only hit areas are the actions' own.",
  reducedMotion:
    "The visual's pieces are in place from the start, without rising or fading in.",
};
