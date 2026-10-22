import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "PreferencesMatrix",
  kind: "component",
  purpose:
    "A grid of on and off choices: what to be told about, in groups, against the ways to be told, such as email, text and push.",
  useWhen: [
    'Notification preferences across channels, on a SettingsPage with width="narrow"',
    "Any set of yes-or-no choices that share the same columns",
  ],
  avoidWhen: [
    "One channel: use a list of Switches or Checkboxes",
    "Choices that wait for a Save across the whole page: put the matrix in a SettingsSection form",
  ],
  related: ["SettingsPage", "Checkbox", "Tabs", "SettingsSection"],
  a11y: 'A group named by label. Each group is a table named by its title, whose heading row repeats the channels as column headers and whose rows\' labels are row headers. Each cell is a checkbox named for its channel and row, such as "Email for Payouts"; a locked cell is a disabled checkbox holding its value. With more than one tab, underline Tabs switch the tables.',
  motion: "indicator",
  keyboard: [
    {
      keys: "Tab",
      does: "Moves from the tab row into the tables and through their checkboxes row by row, skipping locked ones",
    },
    { keys: "Space", does: "Ticks or clears the checkbox with focus" },
    {
      keys: "Left or Right arrow",
      does: "Moves to the tab before or after and shows its tables, when there's more than one tab",
    },
    { keys: "Home or End", does: "Shows the first or last tab" },
  ],
  layout:
    "It fills its container. Each group is a table as wide as the matrix, each channel's column 64px and the row labels taking the rest, their words wrapping. Rows are padded 12px above and below with a 1px line between them, groups sit 32px apart and the tab row 24px above them. Each checkbox is 18px with a 24px target.",
  reducedMotion: "The tab row's underline moves to the chosen tab at once.",
};
