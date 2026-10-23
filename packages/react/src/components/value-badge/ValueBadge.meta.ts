import type { ComponentMeta } from "@butteryui/core";

export const meta: ComponentMeta = {
  name: "ValueBadge",
  kind: "component",
  purpose:
    "A small badge that shows a formatted value and keeps room for its longest value, so it never changes width.",
  useWhen: [
    "The live value beside a slider's label (Slider shows one for you)",
    "A short measurement next to a control: 12px, 45°, 80%",
  ],
  avoidWhen: [
    "A record's state or a count: use StatusBadge",
    "An editable number: use NumberField",
  ],
  related: ["Slider", "NumberField", "StatusBadge"],
  a11y: "Plain text: give its control an aria-valuetext with the same value, as Slider does. The reserved widths are hidden from assistive technology.",
  motion: "none",
  keyboard: [],
  layout:
    "It's --bt-h-badge (20px) tall and as wide as the longest of its value and its reserve values, with tabular digits, so it never changes width as the value moves. It stays on one line without truncating, and it takes no input, so it has no hit area.",
};
