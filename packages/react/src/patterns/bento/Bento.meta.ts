import type { ComponentMeta } from "@butteryui/core";

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
  keyboard: [],
  layout:
    "It's its own size container: from 1024px wide its cards span 4, 6, 8 or 12 of 12 columns, 16px apart; from 640 they take half or all of 6 columns; under 640 they stack. Each row is 320px (--bt-bento-row), a card's title wraps at 22ch, and its visual is clipped at the card's rounded edges.",
  reducedMotion:
    "A card no longer lifts 2px on hover; its shadow still steps up from card to raised.",
};
