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
};
