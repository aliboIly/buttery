import type { ComponentMeta } from "@butteryui/core";

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
  keyboard: [
    {
      keys: "Tab",
      does: "Reaches each of the row's actions in turn, showing them with the row's tint and bar while one has focus",
    },
  ],
  layout:
    "It fills its container's width, padded 8px above and below and 12 at the sides, its content taking the room the actions leave 16px after it; long content shrinks rather than pushing them out. Hidden actions only fade, so they keep their room and nothing moves when they show, and each keeps its own hit area. The 2px accent bar runs the row's full height at its start edge.",
  reducedMotion:
    "Its actions fade in over 100ms rather than 120ms; the tint and the bar show at once, as they always do.",
};
