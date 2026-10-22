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
  keyboard: [
    { keys: "Enter or Space", does: "Opens it from its trigger" },
    {
      keys: "Tab or Shift+Tab",
      does: "Moves to the next or previous control inside it, going round so focus never leaves it",
    },
    {
      keys: "Escape",
      does: "Closes it and hands focus back to what opened it",
    },
  ],
  layout:
    'Dialog.Content is 400px wide (--bt-w-dialog) at size="sm", the default, 560 at "md" and 880 at "lg", never wider than the window less 16px a side, and "full" fills the window less 16px a side. Its height follows its content up to the window\'s, past which the content scrolls inside it. Dialog.Actions sets its buttons in equal columns 8px apart, and size="cta" makes them 48px tall. The close button is a 28px IconButton centered 24px in from the top and end edges.',
  reducedMotion:
    "It and its scrim fade in and out over 100ms, without growing or rising.",
};
