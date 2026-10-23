import type { ComponentMeta } from "@butteryui/core";

export const meta: ComponentMeta = {
  name: "SavedViews",
  kind: "pattern",
  purpose:
    "A track of saved views of a list, the chosen one on a sliding raised pill, with every view and its actions in a menu.",
  useWhen: [
    "Named filters over a table people come back to, such as Unpaid or Wholesale",
    "Letting people save the current filters as a view of their own",
  ],
  avoidWhen: [
    "Counts per state: use StatTabs",
    "Sections of a record: use Tabs",
    "A setting with two to five options: use SegmentedControl",
  ],
  related: ["DataTable", "FilterBar", "StatTabs", "SegmentedControl"],
  a11y: "A radio group named by its label: arrow keys move between views and choose them. The More views button opens a menu with every view as a menuitemradio (the chosen one checked), then the actions and Save as a new view.",
  motion: "indicator",
  keyboard: [
    {
      keys: "Left and Right arrows",
      does: "Move to the previous or next view and choose it, wrapping at the ends",
    },
    { keys: "Home or End", does: "Moves to the first or last view showing" },
    { keys: "Space", does: "Chooses the focused view" },
    {
      keys: "Enter, Space or Down",
      does: "Opens the More views menu from its button, where Up and Down move, Enter chooses and Escape closes",
    },
  ],
  layout:
    "It fills its row with a 34px track (--bt-h-control) on bg-control that hugs its views and the … button. Each view is as wide as its name, the whole pill its hit area, and a long name truncates and shows in full on hover; views that don't fit fold into the menu, the chosen one staying in the track.",
  reducedMotion:
    "The raised pill lands on the chosen view at once instead of sliding.",
};
