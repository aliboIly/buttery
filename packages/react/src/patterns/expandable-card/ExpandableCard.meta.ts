import type { ComponentMeta } from "@buttery/core";

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
};
