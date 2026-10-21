import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "OptionTiles",
  kind: "component",
  purpose:
    "Several choices at once as tiles in a grid, each a checkbox with its words, a chosen tile drawn with an accent border.",
  useWhen: [
    "Picking several things at once from up to about eight, each a few words, such as what someone needs at setup",
    "The answer to the big question in a FullscreenDialog",
  ],
  avoidWhen: [
    "One choice only: use RadioCardGroup or SegmentedControl",
    "A long list, or a choice inside a form's flow: use Checkbox",
  ],
  related: ["Checkbox", "RadioCardGroup", "FullscreenDialog"],
  a11y: "A group named by label. Each tile is a checkbox named by its words and described by its line; Tab moves from tile to tile and Space ticks one. A chosen tile shows a tick as well as its border, so its state never rests on color alone. Disabled tiles are skipped.",
  motion: "none",
};
