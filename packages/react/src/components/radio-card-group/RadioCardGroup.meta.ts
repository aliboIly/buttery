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
};
