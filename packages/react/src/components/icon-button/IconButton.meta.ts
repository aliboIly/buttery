import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "IconButton",
  kind: "component",
  purpose:
    "A square button that shows only an icon, named by a label that also appears as its tooltip.",
  useWhen: [
    "Header and toolbar actions with a well-known icon: undo, redo, help, settings",
    "Closing a dialog (size sm)",
    "Toggles, with aria-pressed",
    "Something new behind it, such as notifications, with dot",
    'A top bar\'s round create button, with variant="primary" and size sm',
  ],
  avoidWhen: [
    "An action without an icon everyone reads the same way: use Button with a label",
    "A page's main action, which needs its words: use Button variant primary",
  ],
  related: ["Button", "Tooltip"],
  a11y: 'A native button named by label (aria-label); the same label shows as a tooltip on hover and keyboard focus, which Radix also links as its description while it\'s open. Toggles use aria-pressed. A dot adds ", new" (or dotLabel) to the name.',
  motion: "press",
};
