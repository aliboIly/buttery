import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "Checkbox",
  kind: "component",
  purpose: "A box to tick for one yes-or-no choice, with its label beside it.",
  useWhen: [
    "Remember me, agree to the terms, email me tips: one choice in a form",
    "A choice that waits for Save, or one of several that can each be on",
  ],
  avoidWhen: [
    "A setting that takes effect at once: use Switch",
    "One choice out of a few: use SegmentedControl",
  ],
  related: ["Switch", "Field", "SignUpForm"],
  a11y: "A real checkbox (role checkbox) named by its label, which takes presses too; Space ticks it. Its box has a 3:1 edge and a 24px target. Indeterminate reads as mixed. An error sets aria-invalid and is read with it.",
  motion: "none",
  keyboard: [{ keys: "Space", does: "Ticks or unticks it" }],
  layout:
    "An 18px box with a 24px target, its label 8px beside it on the same row; a long label wraps onto more lines, and a hint or an error sits under the row. The field takes the width it's given, and the label takes presses as well as the box.",
};
