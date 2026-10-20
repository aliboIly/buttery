import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "Toaster",
  kind: "component",
  purpose:
    "Shows short messages from toast() at the bottom of the window, three at most, each leaving on its own after a few seconds.",
  useWhen: [
    "Confirming an action that changed something out of view: Card deleted, Link copied, Exported",
    "Offering a quick way back, such as Undo after a delete",
    "News the person didn't just cause, such as a sync finishing (background: true)",
  ],
  avoidWhen: [
    "Errors in a form: show them next to the field",
    "Anything people must read or decide on: use a Dialog",
    "Progress that runs for a while: show a notice with FloatingLanes.Item",
    "Messages longer than one line: they truncate",
  ],
  related: ["FloatingLanes", "Presence", "Button"],
  a11y: 'Screen readers hear each toast as it arrives or updates, as "Notification", the message and the action\'s altText; background toasts wait for a pause. F8 moves focus to the toasts, Tab moves through them newest first, each followed by its action, and Escape closes the focused toast (the newest with the region focused). Escape elsewhere is left alone. When the last toast leaves, focus goes back to where it was. The timer stops while the pointer or focus is on the toasts or the window is in the background. With reduced motion they only fade.',
  motion: "presence",
};
