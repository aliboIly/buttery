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
};
