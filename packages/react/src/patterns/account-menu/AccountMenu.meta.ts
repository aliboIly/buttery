import type { ComponentMeta } from "@butteryui/core";

export const meta: ComponentMeta = {
  name: "AccountMenu",
  kind: "pattern",
  purpose:
    "The workspace switcher at the top of a sidebar and its menu: the workspace, switching to another, the person signed in, and signing out.",
  useWhen: [
    "The switcher slot of a Sidebar",
    "An app where people belong to more than one workspace or team",
  ],
  avoidWhen: [
    "Actions on a record: use a Menu",
    "A plain profile link: use a link",
  ],
  related: ["Sidebar", "Menu", "InitialsTile", "Avatar"],
  a11y: "The trigger is a button named \"Workspace\" and the workspace's name, with aria-haspopup and aria-expanded. The menu's items are menuitems; workspaces are menuitemradios with the current one checked. ArrowRight opens Switch workspace.",
  motion: "presence",
  keyboard: [
    {
      keys: "Enter, Space or ArrowDown",
      does: "Opens the menu from the trigger",
    },
    {
      keys: "ArrowUp or ArrowDown",
      does: "Moves to the previous or next item",
    },
    { keys: "Home or End", does: "Moves to the first or last item" },
    { keys: "A letter", does: "Moves to the next item that starts with it" },
    {
      keys: "Enter or Space",
      does: "Chooses the item, or opens Switch workspace or another submenu",
    },
    { keys: "ArrowRight", does: "Opens the submenu of the item it's on" },
    { keys: "ArrowLeft", does: "Closes the submenu and goes back to its item" },
    {
      keys: "Escape",
      does: "Closes the menu and puts focus back on the trigger",
    },
  ],
  layout:
    "The trigger is a 36px row (--bt-h-button) that fills its slot, the workspace's name truncating with an ellipsis and its full name as the title; in a sidebar's rail it's the 20px tile alone, centered, with the name in a tooltip. The menu is 280px wide with 36px items, and the trigger's whole row is its hit area.",
  reducedMotion:
    'The menu and its submenus fade in and out in 100ms instead of growing from the trigger; inside AppShell layout="sidebar" the menu appears and goes at once either way.',
};
