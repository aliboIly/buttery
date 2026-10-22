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
  keyboard: [],
  layout:
    "It's as wide as its parent and as tall as its content and padding. The padding comes from its level (8px for panel and dialog, 6px for floating, a 4px well on three sides for section, none for the rest) unless pad, padX or padY replace it. With radius set to auto, its corners take the parent surface's radius less that surface's padding, never under 4px. It has no hit area of its own: to make one pressable, put a Pressable inside it with asChild.",
};
