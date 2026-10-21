import type { ComponentMeta } from "@buttery/core";

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
};
