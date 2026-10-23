import type { ComponentMeta } from "@butteryui/core";

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
  a11y: 'The trigger is a select-only combobox, a button with role="combobox", named by the label and the value ("Canvas shape, 16:9"), with aria-haspopup="listbox", aria-expanded and aria-controls; in a required Field it has aria-required too. The list is a listbox of options with aria-selected; it opens with focus on the chosen option. Arrow keys, Home and End move, typing jumps, Enter or Space chooses, Escape closes, and focus goes back to the trigger as it closes. A footer is a group named by footerLabel, and Tab loops between the list and its controls.',
  motion: "presence",
  keyboard: [
    {
      keys: "Enter, Space, Arrow Down or Arrow Up",
      does: "Opens the list from the trigger, with focus on the chosen option, or the first when none is chosen",
    },
    {
      keys: "Arrow Down or Arrow Up",
      does: "Moves to the next or previous option, skipping disabled ones",
    },
    { keys: "Home or End", does: "Moves to the first or last option" },
    {
      keys: "Letters",
      does: "Jumps to the next option that starts with them; letters typed within half a second search as one",
    },
    {
      keys: "Enter or Space",
      does: "Chooses the focused option, closes the list and puts focus back on the trigger",
    },
    {
      keys: "Escape",
      does: "Closes the list without choosing and puts focus back on the trigger",
    },
    {
      keys: "Tab",
      does: "Moves between the list and the footer's controls when there's a footer, and stays on the list when there isn't",
    },
  ],
  layout:
    'The ghost trigger is a pill --bt-h-button (36px) tall, or --bt-h-sm (28px) with size="sm", as wide as its value and chevron; the outline box is --bt-h-control (34px) or --bt-h-sm tall and fills its column. The value truncates with an ellipsis and shows in full as its title, and the whole trigger is the hit area. The list is at least --bt-w-menu-min (200px) wide, and an outline list at least as wide as its box; its options are --bt-h-button tall with labels that truncate, and it scrolls inside when the window leaves it less room than it needs.',
  reducedMotion:
    "The list fades in and out over 100ms, without growing from the trigger.",
};
