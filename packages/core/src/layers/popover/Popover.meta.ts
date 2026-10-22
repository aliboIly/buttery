import type { ComponentMeta } from "../../meta.ts";

export const meta: ComponentMeta = {
  name: "Popover",
  kind: "layer",
  purpose:
    "A floating panel anchored to a trigger, on the floating surface in the dropdown layer.",
  useWhen: [
    "Small forms or option lists that belong to one control",
    "Anything that should close on Escape or an outside click",
  ],
  avoidWhen: [
    "Lists of actions: use Menu",
    "Picking one value from a list: use Select",
    "Hover hints: use Tooltip",
    "Blocking decisions: use Dialog (Phase 6)",
  ],
  related: ["Menu", "Select", "Layer", "Surface", "Scrim"],
  a11y: "The trigger gets aria-expanded and aria-controls; the content is a dialog that takes focus on open, closes on Escape and returns focus to the trigger. In a field holding an unsaved edit, the first Escape puts the field back.",
  motion: "presence",
  keyboard: [
    {
      keys: "Enter or Space",
      does: "Opens it from the trigger and moves focus to the first control inside, or to the panel when it has none",
    },
    {
      keys: "Tab or Shift+Tab",
      does: "Moves through the controls inside it, wrapping from the last to the first",
    },
    {
      keys: "Escape",
      does: "Closes it and puts focus back on the trigger; in a field holding an unsaved edit, the first Escape puts the field back",
    },
  ],
  layout:
    "It's as wide and tall as its content, up to the room beside its trigger, and scrolls inside past that. It opens 8px from its trigger, flips or shifts to stay 8px inside the window and never covers the trigger; what's inside it brings its own hit areas.",
  reducedMotion:
    'It fades in and out over 100ms without growing from the trigger; with entrance="instant", and for its scrim, it shows and goes at once either way.',
};
