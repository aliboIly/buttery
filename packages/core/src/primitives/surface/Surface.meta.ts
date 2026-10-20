import type { ComponentMeta } from "../../meta.ts";

export const meta: ComponentMeta = {
  name: "Surface",
  kind: "primitive",
  purpose:
    "One of buttery's surface levels, with background, edge, shadow, radius and padding from the tokens.",
  useWhen: [
    "Panels, sections, cards, floating menus and dialogs",
    'Nesting surfaces with concentric corners (radius="auto")',
  ],
  avoidWhen: [
    "Drawing a box with custom shadows or radii: pick the level that fits",
  ],
  related: ["Stack", "Grid", "Popover"],
  a11y: "No role of its own; add a landmark role or aria-label when a surface is a region the user navigates to.",
  motion: "none",
};
