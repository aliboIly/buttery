import type { ComponentMeta } from "@butteryui/core";

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
  keyboard: [],
  layout:
    "A circle of a fixed size that never grows or shrinks in a row: 20px at xs, 24px at sm (the default), 32px at md or 40px at lg. The picture covers the same circle the initials sit in, so nothing moves when it loads, and it takes no presses of its own.",
};
