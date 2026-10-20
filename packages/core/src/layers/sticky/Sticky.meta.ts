import type { ComponentMeta } from "../../meta.ts";

export const meta: ComponentMeta = {
  name: "Sticky",
  kind: "layer",
  purpose:
    "Keeps content at the top or bottom of its scroll container and publishes the height it takes.",
  useWhen: [
    "Sticky nav bars, sub navs and panel footers",
    "Anything anchors and floating lanes need to stay clear of",
  ],
  avoidWhen: [
    "Free-floating UI over the page: use a Layer",
    "Inspector footers inside a flex column: lay them out in flow",
  ],
  related: ["Layer", "FloatingLanes"],
  a11y: "No role of its own; keep sticky content in source order so it's read where it appears.",
  motion: "none",
};
