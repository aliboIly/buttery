import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "Toaster",
  kind: "component",
  purpose:
    "Shows short messages from toast() at the bottom of the window, three at most, each leaving on its own after a few seconds; ButteryProvider mounts one, so an app only calls toast().",
  useWhen: [
    "Confirming an action that changed something out of view: Card deleted, Link copied, Exported",
    "Offering a quick way back, such as Undo after a delete",
    "News the person didn't just cause, such as a sync finishing (background: true)",
    "A result with a tone: toast.success() when it went well, toast.warning() when it needs a look, toast.danger() when it failed",
  ],
  avoidWhen: [
    "Errors in a form: show them next to the field",
    "Anything people must read or decide on: use a Dialog",
    "Progress that runs for a while: show a notice with FloatingLanes.Item",
    "Messages longer than one line: they truncate",
    "Rendering a Toaster of your own inside ButteryProvider, which already mounts one: call toast(), and pass the Toaster's labels as the provider's toaster to translate them",
  ],
  related: ["FloatingLanes", "Presence", "Button"],
  a11y: 'Screen readers hear each toast as it arrives or updates, as "Notification", its tone for a toned toast ("Success:", "Warning:", "Error:"), the message and the action\'s altText; background toasts wait for a pause. A tone also shows as an icon named by it, so it never rests on color alone. F8 moves focus to the toasts, Tab moves through them newest first, each followed by its action, and Escape closes the focused toast (the newest with the region focused). Escape elsewhere is left alone. When the last toast leaves, focus goes back to where it was. The timer stops while the pointer or focus is on the toasts or the window is in the background. With reduced motion they only fade.',
  motion: "presence",
  keyboard: [
    { keys: "F8", does: "Moves focus to the toasts" },
    {
      keys: "Tab",
      does: "Moves through the toasts, newest first, each followed by its action",
    },
    {
      keys: "Enter or Space",
      does: "Runs the focused action, such as Undo, and closes its toast",
    },
    {
      keys: "Escape",
      does: "Closes the focused toast, or the newest while the toasts' region has focus",
    },
  ],
  layout:
    "Toasts stack in the bottom-center floating lane, 8px apart and three at most, each a pill --bt-h-button (36px) tall and as wide as its message and action, never wider than the lane. A long message truncates with an ellipsis and shows in full as its title, and the action's hit area runs the pill's full height and is at least 24px wide.",
  reducedMotion:
    "Toasts fade in and out over 100ms without rising, and the stack takes its new place at once.",
};
