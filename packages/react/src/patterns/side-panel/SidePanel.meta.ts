import type { ComponentMeta } from "@butteryui/core";

export const meta: ComponentMeta = {
  name: "SidePanel",
  kind: "pattern",
  purpose:
    "A panel docked at the shell's end beside the page, such as help, that makes the page narrower instead of covering it, and opens as a sheet on narrower screens.",
  useWhen: [
    "Help, notes or an assistant that someone keeps open while they work on the page beside it",
    "Details that shouldn't cover the page they're about, in an AppShell's panel slot",
  ],
  avoidWhen: [
    "Something to finish before going back to the page: use Dialog or FormDialog",
    "A record's details that belong to the page itself: use AppPage's aside or DetailPage",
    "A short note beside a control: use Popover or InfoButton",
  ],
  related: ["AppShell", "Dialog", "Menu", "AppPage"],
  a11y: "Docked, it's a complementary landmark named by its title: opening it moves focus to its first field to type in, else to the panel itself, and Escape or its close button closes it and hands focus back to what opened it. As a sheet it's a modal dialog named by its title that keeps focus inside. The expand button is a toggle (aria-pressed); a menu item that deletes or resets something is drawn in danger and says so in its words.",
  motion: "presence",
  keyboard: [
    {
      keys: "Escape",
      does: "Closes the panel and hands focus back to what opened it",
    },
    {
      keys: "Enter or Space",
      does: "Presses the focused header button: expand, which a docked panel has, or close",
    },
    {
      keys: "Enter, Space or Down",
      does: "Opens the More actions menu from its button, where Up and Down move, Enter runs an item and Escape closes just the menu",
    },
    { keys: "Tab", does: "Stays inside the panel while it's a sheet" },
  ],
  layout:
    "Docked, it's 360px wide (560 expanded) and its parent's height, with a 1px edge on its start side and a --bt-h-header (56px) header whose title truncates and shows in full on hover; its body scrolls on its own above the pinned footer. As a sheet it sits 8px in from the window's end, up to 360px wide; either way its header buttons are 28px.",
  reducedMotion:
    "Docked, its content fades in over 100ms instead of 120; as a sheet it fades in and out over 100ms without rising, its scrim fading with it.",
};
