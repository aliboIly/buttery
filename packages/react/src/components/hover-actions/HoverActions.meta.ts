import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "HoverActions",
  kind: "component",
  purpose:
    "A row whose actions stay out of sight until it's hovered or holds keyboard focus, when they show with an accent bar at its start.",
  useWhen: [
    "A list of things, each with an action that would clutter the list if every row showed it, such as a settings gear",
    "Rows in a settings list or a short table-like list",
  ],
  avoidWhen: [
    "The row's main action: make the row itself the link or button",
    "A DataTable's row actions: DataTable shows its own menu button",
    "Actions people need to find without hovering: show them as buttons",
  ],
  related: ["GroupedList", "DataTable", "IconButton", "SettingRow"],
  a11y: "The actions stay in the tab order while out of sight, so Tab reaches each one and shows it (and the row's bar and tint) while it has focus. On a touch screen, which can't hover, the actions always show. The bar is decorative and hidden from screen readers; name each action for its row, such as \"Settings for payouts\".",
  motion: "hover",
};
