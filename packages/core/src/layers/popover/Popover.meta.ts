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
};
