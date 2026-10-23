import type { ComponentMeta } from "../../meta.ts";

export const meta: ComponentMeta = {
  name: "Inline",
  kind: "primitive",
  purpose:
    "Lays children out in a row with a gap from the spacing scale, vertically centered by default.",
  useWhen: [
    "Icons next to labels, button groups, chips in a row",
    "Equal-width button pairs with uniform",
  ],
  avoidWhen: [
    "Toolbars, header bars and nav bars that might run out of room: use OverflowCluster",
    "Columns of content: use Stack or Grid",
  ],
  related: ["Stack", "Grid", "OverflowCluster"],
  a11y: "No role of its own; reading order follows source order, so keep the visual and DOM order the same.",
  motion: "none",
  keyboard: [],
  layout:
    "It's as wide as its parent and as tall as its tallest child, with its children in one row a gap apart, vertically centered unless align says otherwise. Children can shrink below their content's width, the row wraps only with wrap, and uniform gives every child the same width. It has no hit area of its own.",
};
