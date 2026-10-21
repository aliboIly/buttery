import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "Dialog",
  kind: "component",
  purpose:
    "A modal dialog that dims the page, traps focus and hands it back when it closes.",
  useWhen: [
    "A decision or a short task to finish before going on: confirm a delete, rename a card",
    "Something that needs full attention for a moment, such as an announcement",
  ],
  avoidWhen: [
    "News that needs no answer: use a toast",
    "Settings beside the work: use a Popover or the Inspector",
    "Errors in a form: show them next to the field",
  ],
  related: ["Popover", "Toaster", "Button", "TextStack"],
  a11y: "A modal dialog (aria-modal) named by its Dialog.Text title, or by label without one, and described by the text's body. Focus moves to the first control in its body, or to the dialog itself when there's none so the close button's tooltip stays shut; Tab stays inside; Escape, the close button or a press outside closes it and focus goes back to what opened it. The page behind is hidden from screen readers while it's open.",
  motion: "presence",
};
