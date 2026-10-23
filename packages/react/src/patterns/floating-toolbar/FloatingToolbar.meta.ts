import type { ComponentMeta } from "@butteryui/core";

export const meta: ComponentMeta = {
  name: "FloatingToolbar",
  kind: "pattern",
  purpose:
    "A floating pill of actions anchored under an element, such as crop mode's size, Reset, Cancel and Apply.",
  useWhen: [
    "Actions for a mode that works on one element: crop, trim, a selection",
  ],
  avoidWhen: [
    "Actions that are always there: put them in the HeaderBar or an inspector",
    "A message: use toast()",
  ],
  related: ["Stage", "HeaderBar", "FloatingLanes"],
  a11y: "A toolbar named by label: one Tab stop, with the arrow keys moving between its buttons. Toasts and notices move out of its way instead of covering it.",
  motion: "presence",
  keyboard: [
    {
      keys: "Tab",
      does: "Moves into the toolbar, on the button that last had focus, and out again: the toolbar is one tab stop",
    },
    {
      keys: "Left and Right arrows",
      does: 'Move between its buttons, wrapping at the ends; with dir="rtl" they run the other way',
    },
    { keys: "Home or End", does: "Moves to its first or last button" },
    { keys: "Enter or Space", does: "Presses the focused button" },
  ],
  layout:
    "It's a 48px pill (--bt-h-cta) as wide as its meta and buttons, and never wider than the viewport less 8px a side. It sits centered 12px under its anchor, or above it when there's no room below, and stays 8px inside the viewport as the anchor moves; the meta truncates with its full text in its title, and the buttons keep their size.",
  reducedMotion:
    "It fades in and out in 100ms where it stands, without rising, and a delayed one arrives without its 80ms wait.",
};
