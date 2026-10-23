import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "Accordion",
  kind: "component",
  purpose:
    "A list of items that each open in place: a trigger row over a panel whose height follows its content.",
  useWhen: [
    "Questions and answers, or any list of titles whose details only some people need",
    "Long details or settings in parts that people open one or a few at a time, such as an account's",
    "A narrow panel with more in it than fits, where each part's title is enough to pick it",
  ],
  avoidWhen: [
    "A whole section of questions with groups and a search: use Faq",
    "Switching between views of one thing: use Tabs",
    "One part that shows more: a button over a Morph",
    "What everyone needs to read: show it instead of folding it away",
  ],
  related: ["Faq", "Tabs", "Morph", "GroupedList"],
  a11y: "Each trigger is a button in a heading (an h3 unless headingLevel says otherwise), named by its title followed by its description, with aria-expanded, and aria-controls naming its panel while it's open; the panel is a region named by the title alone. Tab moves from trigger to trigger and into an open panel; the arrow keys move between triggers, wrapping at the ends, and Home and End reach the first and last. A disabled item's trigger is left out of both.",
  motion: "morph",
  keyboard: [
    {
      keys: "Enter or Space",
      does: "Opens or closes the item whose trigger has focus",
    },
    {
      keys: "Tab",
      does: "Moves to the next trigger, going through an open panel's content first",
    },
    {
      keys: "Arrow Down or Arrow Up",
      does: "Moves to the next or previous trigger, wrapping at the ends and skipping disabled ones",
    },
    { keys: "Home or End", does: "Moves to the first or last trigger" },
  ],
  layout:
    "It fills its container's width with its items stacked: touching, with a hairline between them (divided); in one card (contained); 8px apart, a card each (cards); or 2px apart (plain). A trigger row is as tall as its title, which wraps onto more lines and never truncates, with 12, 16 or 20px above and below it by size; the whole row is the trigger's hit area. Its chevron and an icon sit on the middle of the title's first line, and the panel's content starts at the row's padding edge, under the icon. Divided rows have no side padding, so their words line up with the text around them.",
  reducedMotion:
    "The panel opens and closes at once and the chevron turns over at once; the panel's content fades in and out in 100ms.",
};
