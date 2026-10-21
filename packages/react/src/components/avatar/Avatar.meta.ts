import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "Avatar",
  kind: "component",
  purpose:
    "A person's round picture, or their initials when there's none or it fails to load.",
  useWhen: [
    "A person next to their name: a table's customer column, an account menu's user row, a comment",
    "People shown by face alone, such as who's working on something (give each a label)",
  ],
  avoidWhen: [
    "A workspace, team or company: use InitialsTile, which is square",
    "A decorative illustration: use an image",
  ],
  related: ["InitialsTile", "AccountMenu"],
  a11y: "Decorative by default, since the person's name is usually written beside it; give it a label when it stands alone, and it becomes an image named by it. The picture's own alt is empty, so the name is never read twice.",
  motion: "none",
};
