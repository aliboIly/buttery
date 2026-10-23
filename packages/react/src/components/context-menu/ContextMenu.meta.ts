import type { ComponentMeta } from "@butteryui/core";

export const meta: ComponentMeta = {
  name: "ContextMenu",
  kind: "component",
  purpose:
    "A menu of actions for what's under the pointer: it opens where a right-click or a long press lands, or at the focused element from the keyboard.",
  useWhen: [
    "Actions on something people point at in a list, a board, a canvas or a table: duplicate, move, recolor, delete",
    "The actions a toolbar or a row's … menu already offers, for people who reach for the right mouse button",
    "Shortcuts worth learning: an item shows its keys, and the keys work while focus is in the region",
  ],
  avoidWhen: [
    "The only way to an action: many people never right-click, so put it on a button, a … menu or the toolbar too",
    "A list of actions that opens from a button: use Menu",
    "Choosing a value a form submits: use Select",
  ],
  related: ["Menu", "Kbd", "Popover", "Select"],
  a11y: "The trigger keeps its own role and name, and has to take focus or hold something that does. The context-menu key or Shift+F10 opens the menu at the focused element (at the option a focused list's aria-activedescendant points at) with focus on its first item. The content is a menu of menuitems (menuitemcheckbox and menuitemradio, with aria-checked), named by its aria-label. Arrow keys move, typing jumps to an item, Enter or Space chooses, and Escape closes it and puts focus back where it was, unless a press elsewhere closed it. An item's shortcut is announced through aria-keyshortcuts and works while focus is in the trigger and the menu is closed. A submenu's item has aria-haspopup and aria-expanded; ArrowRight opens it and ArrowLeft closes it.",
  motion: "presence",
  keyboard: [
    {
      keys: "Shift+F10 or the context-menu key",
      does: "Opens the menu at the focused element, with focus on its first item",
    },
    {
      keys: "An item's shortcut",
      does: "Runs the item while focus is in the trigger and the menu is closed",
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
      does: "Closes the menu and puts focus back where it was",
    },
  ],
  layout:
    "Its corner opens 2px beside the pointer, or beside the middle of the focused element: to the right and level with it, to the left where the right has no room, and ending level with it where there's no room below. It keeps 8px inside the window and scrolls inside when it's taller than the room. Each item is --bt-h-button (36px) tall and its whole row is its hit area; long labels truncate with an ellipsis and show in full as their title. The list is at least --bt-w-menu-min (200px) wide. The trigger keeps its own size and layout.",
  reducedMotion:
    'It fades in and out over 100ms without growing from its corner, and so does a submenu; with entrance="instant" it shows and goes at once either way.',
};
