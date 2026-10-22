import type { ComponentMeta } from "../../meta.ts";

export const meta: ComponentMeta = {
  name: "Grid",
  kind: "primitive",
  purpose: "Equal columns with a gap from the spacing scale.",
  useWhen: ["Cards in a grid, swatch grids, any set of equal peers"],
  avoidWhen: [
    "One row of controls: use Inline",
    "Page layouts on the 12-column grid: use Page and Section (Phase 6)",
  ],
  related: ["Stack", "Inline"],
  a11y: "No role of its own; items are read row by row in source order.",
  motion: "none",
  keyboard: [],
  layout:
    "It's as wide as its parent, split into equal columns that can each shrink to nothing, so one long item never widens its column. Given an object, the columns change at 640px and 1024px of the nearest size container. Each row is as tall as its tallest item, which the others stretch to unless align says otherwise. It has no hit area of its own.",
};
