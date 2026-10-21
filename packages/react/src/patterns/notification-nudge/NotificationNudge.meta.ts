import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "NotificationNudge",
  kind: "pattern",
  purpose:
    "A small popover that points at a button with news, once: a title, a line, an action and Later, opening by itself without taking focus.",
  useWhen: [
    "Pointing out something new behind a button, such as replies waiting behind the notifications bell",
    "A one-time hint about a control people haven't found",
  ],
  avoidWhen: [
    "Something that just happened because of what someone did: use a toast",
    "A suggestion that stays until it's done: use Banner or RecommendationCard",
  ],
  related: ["IconButton", "Popover", "TopBar", "Banner"],
  a11y: "It opens by itself once its button is in view, without moving focus, and its title is announced as a status. It's a non-modal dialog named by its title. Tab from its button goes into it, Shift+Tab from its first button goes back, and Tab from its last goes on to what follows the button. Escape, Later, the action or a press outside closes it, and it doesn't open by itself again for the same storageKey.",
  motion: "presence",
};
