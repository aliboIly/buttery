import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "Select",
  kind: "component",
  purpose:
    "A trigger that shows the chosen value and opens a list to pick another, with an optional footer for custom values.",
  useWhen: [
    "A value a control shows and keeps, picked from a list: a canvas shape, an export format",
    "A list of presets with a custom value beside them, through footer",
  ],
  avoidWhen: [
    "Two to four options that fit side by side: use SegmentedControl",
    "Actions rather than a value: use Menu",
    "A choice in a form that waits for submit with many options: a native select styled with bt-control",
  ],
  related: ["Menu", "SegmentedControl", "NumberField", "Popover"],
  a11y: 'The trigger is a button named by the label and the value ("Canvas shape, 16:9") with aria-haspopup="listbox", aria-expanded and aria-controls. The list is a listbox of options with aria-selected; it opens with focus on the chosen option. Arrow keys, Home and End move, typing jumps, Enter or Space chooses, Escape closes, and focus goes back to the trigger as it closes. A footer is a group named by footerLabel, and Tab loops between the list and its controls.',
  motion: "presence",
};
