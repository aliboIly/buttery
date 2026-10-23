import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "RadioCardGroup",
  kind: "component",
  purpose:
    "A choice of one among a few options, each with a line about it, where a chosen option can reveal a field of its own.",
  useWhen: [
    "Two to five ways to set something, each needing a sentence to explain, often in a dialog",
    "A choice where one option needs a detail of its own, such as how many renewals to screen",
  ],
  avoidWhen: [
    "Short options without explanations: use SegmentedControl",
    "Many options: use Select",
    "Several choices at once: use Checkboxes or OptionTiles",
  ],
  related: ["SegmentedControl", "Select", "OptionTiles", "FormDialog"],
  a11y: "A radio group named by label. Each option is a radio named by its label and described by its line; arrow keys move between options and choose as they go, skipping disabled ones. A chosen option's detail follows its radio in the reading order. Each radio's target is 24px.",
  motion: "morph",
  keyboard: [
    {
      keys: "Tab",
      does: "Moves to the chosen option, then into its detail if it has one, then out of the group",
    },
    {
      keys: "Arrow keys",
      does: "Moves to the next or previous option and chooses it, going round at the ends and skipping disabled ones",
    },
    { keys: "Space", does: "Chooses the option with focus" },
  ],
  layout:
    "It fills its container, its options stacked 12px apart. Each radio is 18px with a 24px target, its label 8px after it and wrapping, and the line and any detail under it line up with the label. A chosen option's detail opens under its line.",
  reducedMotion:
    "A chosen option's detail opens and closes at once, its height jumping, while its content fades in over 100ms.",
};
