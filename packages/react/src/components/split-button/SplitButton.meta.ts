import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "SplitButton",
  kind: "component",
  purpose:
    "A primary action with a menu of related ones beside it: two halves of one pill, each its own button.",
  useWhen: [
    "One main action with a few close alternatives: Export, with Export as JPG and Copy to clipboard",
    "The footer of an inspector or a dialog where the main action has variants",
  ],
  avoidWhen: [
    "Actions that are equally likely: show them as separate buttons",
    "More than six alternatives, or settings: use a menu or a dialog",
  ],
  related: ["Button", "Menu"],
  a11y: "A group of two buttons, each a tab stop: the main half is named by its label, the chevron half by menuLabel. The chevron opens a menu: arrow keys move, Enter chooses, Escape closes and returns focus.",
  motion: "press",
};
