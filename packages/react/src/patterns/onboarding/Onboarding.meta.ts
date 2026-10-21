import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "Onboarding",
  kind: "pattern",
  purpose:
    "A few steps in a dialog: a scene that morphs between steps, text that crossfades in place, page dots, Back and Next, and confetti at the end.",
  useWhen: [
    "Showing a new app's three to five main ideas the first time it opens",
    "A short tour someone can open again from a Help button",
  ],
  avoidWhen: [
    "A single message: use Dialog",
    "A task with inputs and steps: use a page or a form",
    "Tips while working: use a Tooltip or a Callout",
  ],
  related: ["Dialog", "PageDots", "Confetti", "Button"],
  a11y: "A modal dialog named by the current step's title and described by its body. As a step arrives a polite live region says \"Step 2 of 4\" and its title. Back is quiet but still focusable on the first step; left and right arrows move between steps outside text fields; the finish button's label changes inside the same button, so focus stays on it. The page dots are one image naming the step. With reduced motion the scenes and text fade in 100ms and the confetti stays off.",
  motion: "morph",
};
