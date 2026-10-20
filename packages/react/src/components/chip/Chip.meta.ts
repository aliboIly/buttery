import type { ComponentMeta } from "@buttery/core";

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
};
