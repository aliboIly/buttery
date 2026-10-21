import type { ComponentMeta } from "@buttery/core";

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
};
