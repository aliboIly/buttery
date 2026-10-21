import type { ComponentMeta } from "@buttery/core";

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
};
