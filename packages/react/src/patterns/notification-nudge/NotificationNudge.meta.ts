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
  a11y: "It opens by itself once its button is in view, no modal dialog is open and opensItself isn't false, without moving focus, and its title is announced as a status. It's a non-modal dialog named by its title. Tab from its button goes into it, Shift+Tab from its first button goes back, and Tab from its last goes on to what follows the button. Escape, Later, the action or a press outside closes it, and it doesn't open by itself again for the same storageKey.",
  motion: "presence",
  keyboard: [
    {
      keys: "Enter or Space",
      does: "Opens or closes the nudge from its button, or presses the action or Later, which close it",
    },
    {
      keys: "Tab",
      does: "Goes from its button into the open nudge, and from the nudge's last button on to what follows its button",
    },
    {
      keys: "Shift+Tab",
      does: "Goes from the nudge's first button back to its button",
    },
    {
      keys: "Escape",
      does: "Closes the nudge and puts focus back on its button",
    },
  ],
  layout:
    "It opens 8px from its button, below it and lined up with its end edge by default, as a popover at most 280px wide and never wider than the room beside the button, kept inside the window without covering the button. Its title and line wrap, its two 28px buttons wrap onto a new line when they don't fit, and the button it points at keeps its own size and hit area.",
  reducedMotion: "It fades in and out in 100ms without growing.",
};
