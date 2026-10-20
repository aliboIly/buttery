import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "AppShell",
  kind: "pattern",
  purpose:
    "A whole editor screen: a header and a stage beside an inspector that becomes a sheet on narrow screens.",
  useWhen: [
    "An editor or a tool: a document's header, its canvas, and the settings for it",
  ],
  avoidWhen: [
    "A marketing or content page: use Page and Section (Phase 6)",
    "A settings screen with no canvas: an Inspector alone, or a form",
  ],
  related: ["HeaderBar", "Stage", "Inspector"],
  a11y: "The parts keep their own semantics (the header, the stage's image, the inspector's region). On a narrow screen the inspector opens as a modal sheet named by inspectorLabel, from a button under the stage; Escape or a press on the scrim closes it and focus goes back to the button.",
  motion: "presence",
};
