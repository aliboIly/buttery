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
};
