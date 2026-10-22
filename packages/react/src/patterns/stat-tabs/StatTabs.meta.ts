import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "StatTabs",
  kind: "pattern",
  purpose:
    "Equal tabs over a list that each show a view's count, the chosen one on a sliding raised panel, a select on a phone.",
  useWhen: [
    "Splitting a table by state with how many rows each holds: All, Unpaid, Shipped",
    "Three to five views where the counts matter",
  ],
  avoidWhen: [
    "Named filters people save: use SavedViews",
    "Sections of a record: use Tabs",
  ],
  related: ["SavedViews", "Tabs", "DataTable", "Select"],
  a11y: "A radio group named by its label; each tab is a radio named by its label and count, and arrow keys move the choice. Under 640px it's a select named by the same label.",
  motion: "indicator",
  keyboard: [
    {
      keys: "Left and Right arrows",
      does: "Move to the previous or next tab and choose it, wrapping at the ends",
    },
    { keys: "Home or End", does: "Moves to the first or last tab" },
    { keys: "Space", does: "Chooses the focused tab" },
    {
      keys: "Enter, Space, Up or Down",
      does: "Opens the select it becomes under 640px, where Up and Down move, Enter chooses and Escape closes",
    },
  ],
  layout:
    "It fills its parent's width in a 48px track, the tabs sharing it equally, each one its whole hit area; a long label truncates and shows in full on hover, and the count keeps its size. Under 640px of its own width it's an outline select as wide as its parent.",
  reducedMotion:
    "The raised panel lands on the chosen tab at once instead of sliding.",
};
