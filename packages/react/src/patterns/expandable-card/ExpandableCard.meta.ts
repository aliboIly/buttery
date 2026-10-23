import type { ComponentMeta } from "@butteryui/core";

export const meta: ComponentMeta = {
  name: "ExpandableCard",
  kind: "pattern",
  purpose:
    "A bento card that opens into a dialog by turning into it, its title travelling along, and closes back into the card.",
  useWhen: [
    "A feature card with more to say than fits: a short video, steps, a longer note",
  ],
  avoidWhen: [
    "A card that links to its own page: put a link in a Bento.Card",
    "A decision or a form: use Dialog",
  ],
  related: ["Bento", "Dialog", "Section"],
  a11y: 'The card is an article named by its title; its expand button ("Open" and the title) opens a modal dialog named by the same title. Escape, the close button or a press outside closes it, and focus goes back to the expand button. With reduced motion the dialog fades in and out instead of growing from the card.',
  motion: "morph",
  keyboard: [
    {
      keys: "Enter or Space",
      does: "Opens the card into its dialog from the expand button",
    },
    {
      keys: "Tab or Shift+Tab",
      does: "Moves through what's in the open dialog and its close button, staying inside",
    },
    {
      keys: "Escape",
      does: "Closes the dialog back into the card, with focus on the expand button",
    },
  ],
  layout:
    "In a Bento it spans 4, 6, 8 or 12 of 12 columns and one or two 320px rows (--bt-bento-row) like any card, with a 28px expand button at its top end; the whole card is the press target. Open, it's a dialog at most 880px wide (--bt-w-dialog-lg) with the card's radius, 16px inside the window, scrolling inside when its detail is taller.",
  reducedMotion:
    "The dialog fades in and out in place in 100ms instead of growing out of the card, the title doesn't travel, and the other cards fade back in 100ms.",
};
