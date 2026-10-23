import type { ComponentMeta } from "@butteryui/core";

export const meta: ComponentMeta = {
  name: "Chip",
  kind: "component",
  purpose:
    "A small reset action that sits next to a control, such as Reset beside a slider's label.",
  useWhen: [
    "Resetting one control to its default, beside that control's label",
    "A tiny secondary action inside a dense inspector row",
  ],
  avoidWhen: [
    "Any standalone action: use Button (chips are too small to stand alone)",
    "Filters or tags: buttery has no filter chip yet",
  ],
  related: ["Button", "Slider"],
  a11y: 'A native button named by its text, type="button". Its 24px hit area is larger than its 20px box. Disabled while there\'s nothing to reset.',
  motion: "press",
  keyboard: [
    { keys: "Enter or Space", does: "Presses it, unless it's aria-disabled" },
  ],
  layout:
    "It's --bt-h-badge (20px) tall and as wide as its label, never wider than its container, where a long label truncates with an ellipsis and shows in full as its title. Its hit area reaches 24px both ways, past its 20px box.",
  reducedMotion: "It presses in at once, without the scale animating.",
};
