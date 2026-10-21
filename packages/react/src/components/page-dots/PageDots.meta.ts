import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "PageDots",
  kind: "component",
  purpose:
    "A row of dots showing which step of a few is current, the current one a pill that slides on spring.snappy.",
  useWhen: [
    "Showing progress through a few steps, such as an onboarding dialog's",
  ],
  avoidWhen: [
    "Choosing a step: use SegmentedControl or buttons, since the dots take no presses",
    "Many steps or a long task: use a progress bar or a step list",
  ],
  related: ["SegmentedControl", "Dialog", "SharedIndicator"],
  a11y: 'One image named by the current step, "Step 2 of 4" (label changes the words). The dots take no presses or focus; the controls beside them move between steps.',
  motion: "indicator",
};
