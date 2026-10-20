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
};
