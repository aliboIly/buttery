import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "FullscreenDialog",
  kind: "pattern",
  purpose:
    "A dialog that takes the whole window for one big question, such as what someone needs to get started, its answer below and its actions at the bottom end.",
  useWhen: [
    "One question that deserves the whole screen, such as what someone needs at setup or how to start",
    "A choice with more tiles than a small dialog holds comfortably",
  ],
  avoidWhen: [
    "A short confirm: use Dialog",
    "A few fields to fill in: use FormDialog",
    "Spelling out what a yes costs: use ConsequenceDialog",
  ],
  related: ["Dialog", "OptionTiles", "RadioCardGroup", "FormDialog"],
  a11y: "A modal dialog named by its whole headline. Focus moves to the dialog itself as it opens and, once it has settled, to the first control in it; it stays inside, and goes back to what opened it when it closes. Escape or the close button closes it.",
  motion: "presence",
};
