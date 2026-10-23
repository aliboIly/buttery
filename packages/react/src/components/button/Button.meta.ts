import type { ComponentMeta } from "@butteryui/core";

export const meta: ComponentMeta = {
  name: "Button",
  kind: "component",
  purpose:
    "A button for actions: four variants, three sizes, a loading state, icons and a navigation arrow.",
  useWhen: [
    "Actions: save, export, add, open a dialog",
    'Steps forward and back with arrow="forward" or arrow="back": Next, Back, Continue, Get started',
    "A link that should look like a button, with asChild",
    'A main action with its keyboard shortcut shown after the label, with shortcut="n"',
  ],
  avoidWhen: [
    "An action shown only as an icon: use IconButton",
    "A link inside text or a quiet 'See all': use ArrowLink",
    "Picking one of a few options: use SegmentedControl",
    "A main action with a few alternatives: use SplitButton",
  ],
  related: ["IconButton", "ArrowLink", "SplitButton", "Pressable"],
  a11y: 'A native button, or the element you give it with asChild, named by its label; type="button" by default. loading sets aria-busy and aria-disabled and ignores presses, keeping focus where it is. aria-disabled on its own does the same without the spinner: the button stays in the Tab order and screen readers announce it as unavailable, while disabled takes it out of the Tab order, so keyboard and screen-reader users pass it without hearing it. A shortcut is announced through aria-keyshortcuts; bind it with useShortcut. Icons, the arrow and the spinner are hidden from assistive technology.',
  motion: "press",
  keyboard: [
    {
      keys: "Enter or Space",
      does: "Presses it, unless it's loading or aria-disabled",
    },
    { keys: "Enter", does: "Follows the link, when it's a link with asChild" },
  ],
  layout:
    "Its height is its size's token: --bt-h-sm (28px), --bt-h-button (36px) or --bt-h-cta (48px). It's as wide as its label and padding, never wider than its container, where a long label truncates with an ellipsis and shows in full as its title. The whole pill is the hit area, and loading keeps its size.",
  reducedMotion:
    "It presses in at once, and an arrow grows its stem at once, without the nudge.",
};
