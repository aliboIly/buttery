import type { ComponentMeta } from "@butteryui/core";

export const meta: ComponentMeta = {
  name: "TagChip",
  kind: "component",
  purpose:
    "A small outlined tag with a colored dot, for what something is, such as new or a free trial.",
  useWhen: [
    "Tags on a catalog card, such as new, popular or free trial",
    "A few words that sort things into kinds, in a row of tags",
  ],
  avoidWhen: [
    "A status, such as paid or overdue: use StatusBadge",
    "A filter someone can remove: use FilterPill",
    "A count: use ValueBadge",
  ],
  related: ["StatusBadge", "CatalogPage", "ValueBadge"],
  a11y: "Text: its words are read and its dot is hidden from screen readers, so the color never carries meaning on its own. Long words truncate with the full text in a title.",
  motion: "none",
  keyboard: [],
  layout:
    "It's --bt-h-badge (20px) tall and as wide as its dot, its words and its padding. It's never wider than its container, where long words truncate with an ellipsis and show in full as its title, and it takes no input, so it has no hit area.",
};
