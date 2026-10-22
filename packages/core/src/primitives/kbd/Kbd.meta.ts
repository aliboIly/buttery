import type { ComponentMeta } from "../../meta.ts";

export const meta: ComponentMeta = {
  name: "Kbd",
  kind: "primitive",
  purpose:
    "Keycaps for a keyboard shortcut, with mod shown as Command on Apple platforms and Ctrl elsewhere.",
  useWhen: [
    "Showing a shortcut next to a menu item, in a tooltip or in help text",
    'Platform-aware shortcuts: keys={["mod", "K"]}',
  ],
  avoidWhen: [
    "Code or file names: use code",
    "Anything people press: a keycap is a label, not a button",
  ],
  related: ["Tooltip", "Text"],
  a11y: "Renders nested kbd elements, one per key. Symbols such as ⌘ and ⇧ carry visually hidden names, so screen readers say Command and Shift.",
  motion: "none",
  keyboard: [],
  layout:
    "Each key is a cap --bt-h-badge (20px) tall and at least as wide, with 4px of padding either side, in the kbd text role; a shortcut's caps sit 2px apart in a row that never wraps or shrinks. A keycap is a label, with no hit area.",
};
