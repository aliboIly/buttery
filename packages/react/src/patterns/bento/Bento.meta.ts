import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "Bento",
  kind: "pattern",
  purpose:
    "A grid of feature cards on a 12-column page grid, each spanning 4, 6, 8 or 12 columns and one or two rows.",
  useWhen: [
    "Showing a product's features as pictures with short titles",
    "A mix of large and small cards that should still line up",
  ],
  avoidWhen: [
    "A list of equal items: use Grid",
    "Settings or links: use a settings index or a list",
  ],
  related: ["ExpandableCard", "Section", "Grid", "Surface"],
  a11y: "Each card is an article named by its title, an h3. Cards that only show a picture take no focus; give an interactive card a control of its own.",
  motion: "hover",
};
