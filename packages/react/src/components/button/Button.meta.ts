import type { ComponentMeta } from "@buttery/core";

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
  a11y: 'A native button, or the element you give it with asChild, named by its label; type="button" by default. loading sets aria-busy and aria-disabled and ignores presses, keeping focus where it is. A shortcut is announced through aria-keyshortcuts; bind it with useShortcut. Icons, the arrow and the spinner are hidden from assistive technology.',
  motion: "press",
};
