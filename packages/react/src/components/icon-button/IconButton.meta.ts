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
  ],
  avoidWhen: [
    "An action without an icon everyone reads the same way: use Button with a label",
    "The main action in view: use Button variant primary",
  ],
  related: ["Button", "Tooltip"],
  a11y: "A native button named by label (aria-label); the same label shows as a tooltip on hover and keyboard focus, which Radix also links as its description while it's open. Toggles use aria-pressed.",
  motion: "press",
};
