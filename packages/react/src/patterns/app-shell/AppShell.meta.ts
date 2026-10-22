import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "AppShell",
  kind: "pattern",
  purpose:
    'A whole app screen: an editor (a header and a stage beside an inspector that becomes a sheet on narrow screens) or, with layout="sidebar", a dashboard (a sidebar beside a top bar and the page).',
  useWhen: [
    "An editor or a tool: a document's header, its canvas, and the settings for it",
    'A dashboard: layout="sidebar" with a Sidebar, a TopBar and an AppPage for each page',
  ],
  avoidWhen: [
    "A marketing or content page: use Page and Section, with a NavBar",
    "A settings screen with no canvas: an Inspector alone, or a form",
  ],
  related: ["HeaderBar", "Stage", "Inspector", "Sidebar", "TopBar", "AppPage"],
  a11y: "The parts keep their own semantics (the header, the stage's image, the inspector's region). On a narrow screen the inspector opens as a modal sheet named by inspectorLabel, from a button under the stage; Escape or a press on the scrim closes it and focus goes back to the button. In the sidebar layout the sidebar is a rail of named icons under 1100px and, under 640, a modal sheet named by sidebarLabel that the top bar's menu button opens (aria-haspopup, aria-expanded); it closes on a link, Escape or the scrim, with focus back on that button, or on the sidebar's current page if the shell widened.",
  motion: "presence",
  keyboard: [
    {
      keys: "Tab",
      does: "In the sidebar layout, reaches Skip to content first; pressing it moves focus past the sidebar and the top bar to the page",
    },
    {
      keys: "Enter or Space",
      does: "Opens the inspector's sheet from the button under the stage, or the sidebar's sheet from the top bar's menu button, on a narrow screen",
    },
    {
      keys: "Tab or Shift+Tab",
      does: "Moves through an open sheet's controls without leaving it",
    },
    {
      keys: "Enter",
      does: "Follows a link in the sidebar's sheet and closes the sheet",
    },
    {
      keys: "Escape",
      does: "Closes the open sheet and puts focus back on the button that opened it",
    },
  ],
  layout:
    'It fills its container\'s height: the editor at most 1380px wide (--bt-w-shell-max), centered, padded and spaced 8, with the 340px inspector (--bt-w-inspector) beside the header and stage, or under 840px a bottom sheet opened by a full-width 48px button under the stage. With layout="sidebar" the 240px sidebar (--bt-w-sidebar) sits beside the top bar and the page, a 56px rail under 1100px of shell and a sheet under 640, and only the sidebar and the page scroll.',
  reducedMotion:
    "The inspector's and the sidebar's sheets fade in and out in 100ms with their scrims instead of rising.",
};
