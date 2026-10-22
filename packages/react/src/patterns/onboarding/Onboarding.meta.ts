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
  keyboard: [
    {
      keys: "Right arrow",
      does: "Goes to the next step, unless focus is in a text field",
    },
    {
      keys: "Left arrow",
      does: "Goes back a step, unless focus is in a text field",
    },
    {
      keys: "Enter or Space",
      does: "Presses Back or the forward button, which starts focused; on the last step it finishes with confetti and closes the dialog",
    },
    {
      keys: "Escape",
      does: "Closes it, remembered under its storageKey, and puts focus back on what opened it",
    },
    {
      keys: "Tab or Shift+Tab",
      does: "Moves between Back, the forward button and the close button, staying inside the dialog",
    },
  ],
  layout:
    "It's a 400px dialog (--bt-w-dialog), never wider than the window less 16px a side: a 384 by 200 scene inset 8px at the top, which keeps its shape as the window narrows, then the title, body and caption, the page dots, and Back and the forward button in two equal columns 48px tall (--bt-h-cta). The text wraps and the dialog's height follows it from step to step, and the forward button keeps its width when Next becomes Done.",
  reducedMotion:
    "The dialog, its scenes and its text fade in 100ms, shared pieces and the page dots take their new places at once, and the confetti stays off, so the last step closes the dialog without waiting for it.",
};
