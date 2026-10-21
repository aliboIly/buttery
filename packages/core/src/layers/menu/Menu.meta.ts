import type { ComponentMeta } from "../../meta.ts";

export const meta: ComponentMeta = {
  name: "Menu",
  kind: "layer",
  purpose:
    "A list of actions that opens from a trigger, on the floating surface in the dropdown layer.",
  useWhen: [
    "Actions that don't fit, or don't need to show, next to their control: duplicate, rename, delete",
    "Picking one of a few settings that apply at once, with Menu.RadioGroup",
  ],
  avoidWhen: [
    "Choosing a value a form submits or a control shows: use Select",
    "A small form or anything with inputs: use Popover",
    "Navigation between pages: use NavBar (Phase 6)",
  ],
  related: ["Select", "Popover", "SplitButton", "OverflowCluster"],
  a11y: "The trigger gets aria-haspopup and aria-expanded; the content is a menu of menuitems (menuitemradio in a radio group, with aria-checked). Arrow keys move, typing jumps to an item, Enter or Space chooses, Escape closes. Focus goes back to the trigger as it closes, unless a press elsewhere closed it, and it never takes focus back once you've moved on. Groups are named by their headings. A submenu's item has aria-haspopup and aria-expanded; ArrowRight opens it and ArrowLeft closes it.",
  motion: "presence",
};
