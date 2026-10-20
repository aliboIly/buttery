import type { ComponentMeta } from "@buttery/core";

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
    "Status or counts on navigation: buttery has no status badge yet",
    "An editable number: use NumberField",
  ],
  related: ["Slider", "NumberField"],
  a11y: "Plain text: give its control an aria-valuetext with the same value, as Slider does. The reserved widths are hidden from assistive technology.",
  motion: "none",
};
