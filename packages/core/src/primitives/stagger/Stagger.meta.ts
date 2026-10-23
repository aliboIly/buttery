import type { ComponentMeta } from "../../meta.ts";

export const meta: ComponentMeta = {
  name: "Stagger",
  kind: "primitive",
  purpose:
    "Brings a group of items in one after another the first time it scrolls into view.",
  useWhen: [
    "Arrivals: the cards of a bento grid, the parts of a hero visual, a list of features",
    "A group whose items should land in order, under 900ms in all",
  ],
  avoidWhen: [
    "A single block: use Reveal",
    "Lists the user edits or scrolls through often: they should just be there",
    "Content that comes and goes: use Presence",
  ],
  related: ["Reveal", "Presence", "Grid"],
  a11y: "Items stay in the accessibility tree and in order while hidden. With reduced motion they show at once.",
  motion: "presence",
  keyboard: [],
  layout:
    "It renders a div, or its child with asChild, so a Grid or Stack around it lays out the items. Waiting items are only transparent, never offset, so the group has its full size from the start. It has no hit area of its own.",
  reducedMotion:
    "The items show at once, without rising or fading in one after another.",
};
