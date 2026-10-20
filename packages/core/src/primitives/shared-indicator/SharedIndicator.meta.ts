import type { ComponentMeta } from "../../meta.ts";

export const meta: ComponentMeta = {
  name: "SharedIndicator",
  kind: "primitive",
  purpose:
    "A selection indicator that slides from the old item to the new one instead of jumping.",
  useWhen: [
    "The active item in a set that shares one track: segmented controls, tabs, numbered steps, an anchor grid",
    "Any highlight that should travel between peers",
  ],
  avoidWhen: [
    "Items that each draw their own surface: the indicator would cross the gaps between them, so put the items in one track",
    "Content swapping in place: use Morph",
    "Something appearing or disappearing: use Presence",
  ],
  related: ["Morph", "Presence", "Pressable"],
  a11y: "Decorative: the indicator is aria-hidden, so the item itself has to say it's selected (aria-checked, aria-selected or aria-current). It moves at once with reduced motion.",
  motion: "indicator",
};
