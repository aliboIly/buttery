import type { ComponentMeta } from "../../meta.ts";

export const meta: ComponentMeta = {
  name: "Menu",
  kind: "layer",
  purpose:
    "A list of actions that opens from a trigger, on the floating surface in the dropdown layer.",
  useWhen: [
    "Actions that don't fit, or don't need to show, next to their control: duplicate, rename, delete",
    "Picking one of a few settings that apply at once, with Menu.RadioGroup, or turning one on or off with Menu.CheckboxItem",
    "A few pages to go to, such as an account menu's, with Menu.Link",
  ],
  avoidWhen: [
    "Choosing a value a form submits or a control shows: use Select",
    "A small form or anything with inputs: use Popover",
    "A site's main navigation: use NavBar, or Sidebar in an app",
  ],
  related: [
    "Select",
    "Popover",
    "ContextMenu",
    "SplitButton",
    "OverflowCluster",
  ],
  a11y: "The trigger gets aria-haspopup and aria-expanded; the content is a menu of menuitems (menuitemcheckbox for Menu.CheckboxItem and menuitemradio in a radio group, each with aria-checked). Arrow keys move, typing jumps to an item, Enter or Space chooses, Escape closes. Focus goes back to the trigger as it closes, unless a press elsewhere closed it, and it never takes focus back once you've moved on. Groups are named by their headings. An item's shortcut is announced through aria-keyshortcuts, and a dot adds \", new\" to its name. A submenu's item has aria-haspopup and aria-expanded; ArrowRight opens it and ArrowLeft closes it.",
  motion: "presence",
  keyboard: [
    {
      keys: "Enter, Space or ArrowDown",
      does: "Opens it from the trigger, with focus on the first item",
    },
    {
      keys: "ArrowDown or ArrowUp",
      does: "Moves to the next or previous item, skipping disabled ones",
    },
    { keys: "Home or End", does: "Moves to the first or last item" },
    {
      keys: "Typing letters",
      does: "Moves to the item whose label starts with them",
    },
    {
      keys: "Enter or Space",
      does: "Chooses the item with focus and closes the menu; on a submenu's item, opens the submenu",
    },
    {
      keys: "ArrowRight",
      does: "Opens a submenu from its item, with focus on its first item",
    },
    {
      keys: "ArrowLeft",
      does: "Closes the submenu and goes back to its item",
    },
    {
      keys: "Escape",
      does: "Closes the menu and puts focus back on the trigger",
    },
  ],
  layout:
    "Each item is --bt-h-button (36px) tall and its whole row is its hit area; long labels truncate with an ellipsis and show in full as their title. The list is at least --bt-w-menu-min (200px) wide, opens 8px from its trigger, stays 8px inside the window and scrolls inside when it's taller than the room there.",
  reducedMotion:
    'It fades in and out over 100ms without growing from the trigger, and so does a submenu; with entrance="instant" it shows and goes at once either way.',
};
