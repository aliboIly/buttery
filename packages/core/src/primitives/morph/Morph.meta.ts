import type { ComponentMeta } from "../../meta.ts";

export const meta: ComponentMeta = {
  name: "Morph",
  kind: "primitive",
  purpose:
    "One container whose content swaps or grows: the height follows the content and swapped content crossfades in place.",
  useWhen: [
    "Content that changes inside the same panel: a fill type switching the swatches, an onboarding step's text",
    "A section that grows or shrinks when its content changes",
  ],
  avoidWhen: [
    "Content that appears and disappears on its own: use Presence",
    "Moving an element between places: use Motion layout or SharedIndicator",
    "Animating width: only height is a sanctioned size animation",
  ],
  related: ["Presence", "SharedIndicator", "Stack"],
  a11y: "No role of its own. Focus stays where it was: put a live region inside when the swap needs announcing.",
  motion: "morph",
};
